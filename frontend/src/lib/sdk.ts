import {
  type Address,
  type Hex,
  encodeAbiParameters,
  parseAbiParameters,
  decodeErrorResult,
  toFunctionSelector,
  formatUnits,
} from "viem";
import { FunctionDispatcherAbi, FunctionRegistryAbi, MockCalcAbi, MockTokenAbi } from "../config/abis";
import { PRESET_FUNCTIONS, CONTRACT_ADDRESSES } from "../config/contracts";

export interface CalldataChunk {
  offset: number;
  hex: string;
  typeGuess: string;
  description: string;
}

export interface DisassembledCalldata {
  isValid: boolean;
  selector: Hex;
  knownSignature?: string;
  category?: string;
  totalBytes: number;
  chunks: CalldataChunk[];
  error?: string;
}

export interface CollisionResult {
  hasCollision: boolean;
  collisions: Array<{
    selector: Hex;
    signatures: string[];
  }>;
}

export class FunctionSelectorSDK {
  /**
   * Computes the 4-byte Keccak-256 function selector from a human-readable signature.
   * e.g. "transfer(address,uint256)" -> "0xa9059cbb"
   */
  static computeBytes4(signature: string): Hex {
    return toFunctionSelector(signature.trim());
  }

  /**
   * Packs 4-byte selector and ABI-encoded parameters into standard EVM calldata.
   */
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

  /**
   * Disassembles raw calldata into 4-byte selector and 32-byte EVM words.
   */
  static disassembleCalldata(raw: string): DisassembledCalldata {
    const clean = raw.trim();
    if (!clean.startsWith("0x") || clean.length < 10) {
      return {
        isValid: false,
        selector: "0x00000000" as Hex,
        totalBytes: 0,
        chunks: [],
        error: "Calldata must be a hex string starting with 0x and at least 4 bytes (10 characters).",
      };
    }

    const selector = clean.slice(0, 10).toLowerCase() as Hex;
    const argsHex = clean.slice(10);
    const totalBytes = (clean.length - 2) / 2;

    const matchedPreset = PRESET_FUNCTIONS.find(
      (p) => p.selector.toLowerCase() === selector.toLowerCase()
    );

    const chunks: CalldataChunk[] = [];
    for (let i = 0; i < argsHex.length; i += 64) {
      const chunkHex = argsHex.slice(i, i + 64);
      const offset = 4 + i / 2;
      const paramIndex = i / 64;

      let typeGuess = "bytes32 / uint256";
      let description = `Argument word #${paramIndex + 1}`;

      if (matchedPreset && matchedPreset.inputs[paramIndex]) {
        const inputDef = matchedPreset.inputs[paramIndex];
        typeGuess = inputDef.type;
        description = `${inputDef.name} (${inputDef.type})`;
      } else if (chunkHex.startsWith("000000000000000000000000") && chunkHex.length === 64) {
        typeGuess = "address";
        description = `0x${chunkHex.slice(24)}`;
      }

      chunks.push({
        offset,
        hex: `0x${chunkHex}`,
        typeGuess,
        description,
      });
    }

    return {
      isValid: true,
      selector,
      knownSignature: matchedPreset?.signature,
      category: matchedPreset?.category,
      totalBytes,
      chunks,
    };
  }

  /**
   * Scans a list of function signatures for 4-byte selector hash collisions.
   */
  static detectCollisions(signatures: string[]): CollisionResult {
    const map = new Map<string, string[]>();

    for (const sig of signatures) {
      const clean = sig.trim();
      if (!clean) continue;
      try {
        const sel = toFunctionSelector(clean).toLowerCase();
        const existing = map.get(sel) || [];
        existing.push(clean);
        map.set(sel, existing);
      } catch {}
    }

    const collisions: Array<{ selector: Hex; signatures: string[] }> = [];
    for (const [sel, sigs] of map.entries()) {
      if (sigs.length > 1) {
        collisions.push({
          selector: sel as Hex,
          signatures: sigs,
        });
      }
    }

    return {
      hasCollision: collisions.length > 0,
      collisions,
    };
  }

  /**
   * Extracts raw revert hex data from nested Viem/RPC errors.
   */
  private static extractErrorHex(err: any): Hex | null {
    if (!err) return null;
    if (typeof err.data === "string" && err.data.startsWith("0x")) return err.data as Hex;
    if (typeof err.error?.data === "string" && err.error.data.startsWith("0x")) return err.error.data as Hex;
    if (typeof err.cause?.data === "string" && err.cause.data.startsWith("0x")) return err.cause.data as Hex;
    if (typeof err.cause?.cause?.data === "string" && err.cause.cause.data.startsWith("0x")) return err.cause.cause.data as Hex;

    const msg = err.message || "";
    const hexMatch = msg.match(/0x[a-fA-F0-9]{8,}/);
    if (hexMatch) return hexMatch[0] as Hex;

    return null;
  }

  /**
   * Decodes custom EVM errors returned by Dispatcher, Registry, or Facets into clear English text.
   */
  static decodeCustomError(err: any): string {
    const errorData = this.extractErrorHex(err);

    if (errorData) {
      const knownAbis = [FunctionDispatcherAbi, FunctionRegistryAbi, MockCalcAbi, MockTokenAbi];
      for (const abi of knownAbis) {
        try {
          const decoded = decodeErrorResult({ abi, data: errorData });
          if (decoded.errorName === "InsufficientBalance") {
            const args: any = decoded.args || [];
            const balanceFormatted = formatUnits(args[1] || 0n, 18);
            const requestedFormatted = formatUnits(args[2] || 0n, 18);
            return `Insufficient Balance: Account balance is ${balanceFormatted} TEST, but attempted to transfer ${requestedFormatted} TEST.`;
          }
          if (decoded.errorName === "InvalidAddress") {
            return "Invalid Recipient Address: Cannot transfer to the zero address (0x0).";
          }
          if (decoded.errorName === "DivisionByZero") {
            return "Division or modulo by zero is prohibited (DivisionByZero).";
          }
          if (decoded.errorName === "CalldataTooShort") {
            return "Calldata Too Short: Minimum 4-byte function selector is required.";
          }
          if (decoded.errorName === "UnknownSelector") {
            return `Unknown Function Selector ${(decoded.args as any)?.[0] || ""} is not registered in FunctionRegistry.`;
          }
          if (decoded.errorName === "Unauthorized") {
            return "Unauthorized Access: Only the contract owner can execute this action.";
          }
          return `Reverted: ${decoded.errorName}(${decoded.args ? JSON.stringify(decoded.args) : ""})`;
        } catch {}
      }
    }

    if (err?.shortMessage) return err.shortMessage;
    if (err?.message) return err.message;
    return "Execution reverted on-chain.";
  }

  /**
   * Generates code snippets for developer integration.
   */
  static generateCodeSnippets(signature: string, selector: Hex, paramTypes: string[]) {
    const viemSnippet = `// 1. Viem / Wagmi Integration
import { createWalletClient, custom, toFunctionSelector } from "viem";
import { sepolia } from "viem/chains";

const client = createWalletClient({
  chain: sepolia,
  transport: custom(window.ethereum)
});

// Call ${signature} through RouteX Dispatcher
const txHash = await client.sendTransaction({
  to: "${CONTRACT_ADDRESSES.dispatcher}",
  data: "${selector}..." // Append ABI-encoded arguments
});`;

    const ethersSnippet = `// 2. Ethers.js (v6) Integration
import { ethers } from "ethers";

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

// Target RouteX Dispatcher Entrypoint
const tx = await signer.sendTransaction({
  to: "${CONTRACT_ADDRESSES.dispatcher}",
  data: "${selector}..." // 4-byte selector + parameters
});
await tx.wait();`;

    const soliditySnippet = `// 3. Solidity / Foundry Interface
interface IRouteXDispatcher {
    fallback() external payable;
}

contract ProtocolConsumer {
    address public immutable dispatcher = ${CONTRACT_ADDRESSES.dispatcher};

    function executeThroughRouter(bytes memory calldataPayload) external {
        (bool success, bytes memory result) = dispatcher.call(calldataPayload);
        require(success, "Dispatcher execution failed");
    }
}`;

    return {
      viem: viemSnippet,
      ethers: ethersSnippet,
      solidity: soliditySnippet,
    };
  }
}
