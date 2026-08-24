import {
  type Address,
  type Hex,
  encodeAbiParameters,
  parseAbiParameters,
  decodeErrorResult,
  toFunctionSelector
} from "viem";
import { FunctionDispatcherAbi, FunctionRegistryAbi } from "../config/abis";

export class FunctionSelectorSDK {
  static computeBytes4(signature: string): Hex {
    return toFunctionSelector(signature.trim());
  }

  static encodeCalldata(selector: Hex, paramTypes: string[], paramValues: any[]): Hex {
    if (paramTypes.length === 0) {
      return selector;
    }
    const signatureParams = paramTypes.join(",");
    const abiParams = parseAbiParameters(signatureParams);
    const encodedArgs = encodeAbiParameters(abiParams, paramValues);
    
    const cleanSelector = selector.startsWith("0x") ? selector.slice(2, 10) : selector.slice(0, 8);
    const cleanArgs = encodedArgs.startsWith("0x") ? encodedArgs.slice(2) : encodedArgs;
    
    return `0x${cleanSelector}${cleanArgs}` as Hex;
  }

  static decodeCustomError(err: any): string {
    const errorData = err?.data || err?.error?.data || err?.cause?.data;
    if (errorData) {
      const knownAbis = [FunctionDispatcherAbi, FunctionRegistryAbi];
      for (const abi of knownAbis) {
        try {
          const decoded = decodeErrorResult({ abi, data: errorData });
          return `Revert: ${decoded.errorName}(${decoded.args ? JSON.stringify(decoded.args) : ""})`;
        } catch {}
      }
    }
    return err?.shortMessage || err?.message || "Execution reverted";
  }
}
