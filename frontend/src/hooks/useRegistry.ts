import { useReadContract, useReadContracts, useAccount, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { FunctionRegistryAbi } from "../config/abis";
import { CONTRACT_ADDRESSES, type SelectorItem } from "../config/contracts";
import { type Address, type Hex } from "viem";
import { useMemo } from "react";

export function useRegistry() {
  const { address } = useAccount();

  // 1. Read Owner from Sepolia
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: FunctionRegistryAbi,
    functionName: "owner",
    chainId: sepolia.id,
  });

  // 2. Read All Selectors from Sepolia
  const {
    data: allSelectors,
    isLoading: isLoadingSelectors,
    refetch: refetchSelectors,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.registry,
    abi: FunctionRegistryAbi,
    functionName: "getAllSelectors",
    chainId: sepolia.id,
  });

  // 3. Batch Read Implementation & Signature for each selector from Sepolia
  const contractsToRead = useMemo(() => {
    if (!allSelectors || allSelectors.length === 0) return [];
    return allSelectors.flatMap((sel) => [
      {
        address: CONTRACT_ADDRESSES.registry,
        abi: FunctionRegistryAbi,
        functionName: "getImplementation" as const,
        args: [sel],
        chainId: sepolia.id,
      },
      {
        address: CONTRACT_ADDRESSES.registry,
        abi: FunctionRegistryAbi,
        functionName: "getSignature" as const,
        args: [sel],
        chainId: sepolia.id,
      },
    ]);
  }, [allSelectors]);

  const { data: multicallData, isLoading: isLoadingDetails, refetch: refetchDetails } = useReadContracts({
    contracts: contractsToRead,
  });

  const routes: SelectorItem[] = useMemo(() => {
    if (!allSelectors || !multicallData) return [];
    const items: SelectorItem[] = [];
    for (let i = 0; i < allSelectors.length; i++) {
      const implResult = multicallData[i * 2]?.result as Address | undefined;
      const sigResult = multicallData[i * 2 + 1]?.result as string | undefined;
      items.push({
        selector: allSelectors[i],
        implementation: implResult || ("0x0000000000000000000000000000000000000000" as Address),
        signature: sigResult || "unknown()",
      });
    }
    return items;
  }, [allSelectors, multicallData]);

  const { writeContractAsync } = useWriteContract();

  const registerSelector = async (selector: Hex, implementation: Address, signature: string) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.registry,
      abi: FunctionRegistryAbi,
      functionName: "register",
      args: [selector, implementation, signature],
      chainId: sepolia.id,
    });
  };

  const replaceSelector = async (selector: Hex, newImplementation: Address) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.registry,
      abi: FunctionRegistryAbi,
      functionName: "replace",
      args: [selector, newImplementation],
      chainId: sepolia.id,
    });
  };

  const removeSelector = async (selector: Hex) => {
    return await writeContractAsync({
      address: CONTRACT_ADDRESSES.registry,
      abi: FunctionRegistryAbi,
      functionName: "remove",
      args: [selector],
      chainId: sepolia.id,
    });
  };

  const isOwner = useMemo(() => {
    if (!address || !owner) return false;
    return address.toLowerCase() === (owner as string).toLowerCase();
  }, [address, owner]);

  const refetchAll = async () => {
    await refetchSelectors();
    await refetchDetails();
  };

  return {
    owner: owner as Address | undefined,
    isOwner,
    routes,
    isLoading: isLoadingSelectors || isLoadingDetails,
    refetch: refetchAll,
    registerSelector,
    replaceSelector,
    removeSelector,
  };
}
