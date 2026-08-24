import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toFunctionSelector, type Hex } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(addr: string, chars = 4): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`;
}

export function computeSelector(signature: string): Hex {
  try {
    return toFunctionSelector(signature.trim());
  } catch {
    return "0x00000000";
  }
}
