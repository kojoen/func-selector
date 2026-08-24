import { useState } from "react";
import { useSendTransaction, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { type Hex } from "viem";

export function useDispatcher() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { sendTransactionAsync } = useSendTransaction();

  const executeCalldata = async (calldata: Hex, value = 0n) => {
    setIsExecuting(true);
    setError(null);
    setResult(null);

    try {
      // 1. Simulate on-chain via eth_call
      if (publicClient) {
        try {
          const simulation = await publicClient.call({
            to: CONTRACT_ADDRESSES.dispatcher,
            data: calldata,
            value,
          });
          if (simulation.data) {
            setResult(`Simulation Return: ${simulation.data}`);
          }
        } catch (simErr: any) {
          const decoded = FunctionSelectorSDK.decodeCustomError(simErr);
          throw new Error(decoded);
        }
      }

      // 2. Send transaction to Dispatcher
      const txHash = await sendTransactionAsync({
        to: CONTRACT_ADDRESSES.dispatcher,
        data: calldata,
        value,
      });

      setResult(`Transaction Broadcasted: ${txHash}`);
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
  };
}
