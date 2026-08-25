import { useState } from "react";
import { useSendTransaction, usePublicClient, useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { createPublicClient, http, fallback, type Hex } from "viem";
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

export function useDispatcher() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: sepolia.id }) || sepoliaPublicClient;
  const { sendTransactionAsync } = useSendTransaction();

  const executeCalldata = async (calldata: Hex, value = 0n) => {
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      if (!address) {
        throw new Error("Please connect your wallet first");
      }

      // 1. Ensure wallet is on Sepolia
      if (chainId && chainId !== sepolia.id && switchChainAsync) {
        await switchChainAsync({ chainId: sepolia.id });
      }

      // 2. Simulate on-chain via eth_call with connected account context
      try {
        const simulation = await publicClient.call({
          account: address,
          to: CONTRACT_ADDRESSES.dispatcher,
          data: calldata,
          value,
        });
        if (simulation.data && simulation.data !== "0x") {
          setResult(`Simulation Output: ${simulation.data}`);
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
      setResult(`Broadcasting tx ${txHash.slice(0, 10)}... (waiting for confirmation)`);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (receipt.status === "reverted") {
        throw new Error("Transaction was mined but execution reverted on-chain.");
      }

      setResult(`Confirmed on block #${receipt.blockNumber} (tx: ${txHash})`);
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
    executeCalldata,
    isExecuting,
    result,
    error,
    publicClient,
  };
}
