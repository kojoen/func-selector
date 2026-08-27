import { useState } from "react";
import { useSendTransaction, usePublicClient, useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { createPublicClient, http, fallback, type Hex, type Address } from "viem";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { SEPOLIA_RPCS } from "../config/wagmi";

// Dedicated resilient public client for Sepolia RPC calls & simulations
export const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: fallback([
    http(SEPOLIA_RPCS[0]),
    http(SEPOLIA_RPCS[1]),
    http(SEPOLIA_RPCS[2]),
  ]),
});

export interface DispatcherResultData {
  output?: string;
  rawHex?: string;
  txHash?: string;
  blockNumber?: string;
  message: string;
}

export function useDispatcher() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [resultData, setResultData] = useState<DispatcherResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: sepolia.id }) || sepoliaPublicClient;
  const { sendTransactionAsync } = useSendTransaction();

  const simulateCalldata = async (calldata: Hex, value = 0n, customCaller?: Address) => {
    setIsExecuting(true);
    setError(null);
    setResultData(null);

    try {
      const caller = customCaller || address || undefined;
      const simulation = await sepoliaPublicClient.call({
        account: caller,
        to: CONTRACT_ADDRESSES.dispatcher,
        data: calldata,
        value,
      });

      let decodedOutput: string | undefined = undefined;
      if (simulation.data && simulation.data !== "0x") {
        try {
          const num = BigInt(simulation.data);
          decodedOutput = num.toString();
        } catch {
          decodedOutput = simulation.data;
        }
      }

      const resObj: DispatcherResultData = {
        output: decodedOutput,
        rawHex: simulation.data || "0x",
        message: decodedOutput ? `Evaluated Output: ${decodedOutput}` : "Execution succeeded (void return)",
      };
      setResultData(resObj);
      return simulation.data;
    } catch (err: any) {
      const errMsg = FunctionSelectorSDK.decodeCustomError(err);
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeCalldata = async (calldata: Hex, value = 0n) => {
    setIsExecuting(true);
    setError(null);
    setResultData(null);

    try {
      if (!address) {
        throw new Error("Please connect your wallet first");
      }

      // 1. Ensure wallet is on Sepolia
      if (chainId && chainId !== sepolia.id && switchChainAsync) {
        await switchChainAsync({ chainId: sepolia.id });
      }

      // 2. Pre-flight simulation to capture calculated output
      let calculatedOutput: string | undefined = undefined;
      let rawHexData = "0x";
      try {
        const simulation = await publicClient.call({
          account: address,
          to: CONTRACT_ADDRESSES.dispatcher,
          data: calldata,
          value,
        });
        if (simulation.data && simulation.data !== "0x") {
          rawHexData = simulation.data;
          try {
            calculatedOutput = BigInt(simulation.data).toString();
          } catch {
            calculatedOutput = simulation.data;
          }
        }
      } catch (simErr: any) {
        const decoded = FunctionSelectorSDK.decodeCustomError(simErr);
        throw new Error(decoded);
      }

      // 3. Send transaction to Dispatcher
      const txHash = await sendTransactionAsync({
        to: CONTRACT_ADDRESSES.dispatcher,
        data: calldata,
        value,
        chainId: sepolia.id,
      });

      // 4. Wait for transaction to be mined
      setResultData({
        output: calculatedOutput,
        rawHex: rawHexData,
        txHash,
        message: `Broadcasting tx ${txHash.slice(0, 10)}... (waiting for block confirmation)`,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (receipt.status === "reverted") {
        throw new Error("Transaction was mined but execution reverted on-chain.");
      }

      const finalRes: DispatcherResultData = {
        output: calculatedOutput,
        rawHex: rawHexData,
        txHash,
        blockNumber: receipt.blockNumber.toString(),
        message: `Confirmed on block #${receipt.blockNumber}`,
      };
      setResultData(finalRes);
      return txHash;
    } catch (err: any) {
      const errMsg = FunctionSelectorSDK.decodeCustomError(err);
      setError(errMsg);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    simulateCalldata,
    executeCalldata,
    isExecuting,
    resultData,
    result: resultData?.message || null,
    error,
    publicClient,
  };
}
