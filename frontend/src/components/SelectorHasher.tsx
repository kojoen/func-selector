"use client";

import { useState } from "react";
import { computeSelector } from "../lib/utils";
import { PRESET_FUNCTIONS } from "../config/contracts";
import { keccak256, stringToBytes } from "viem";
import { toast } from "sonner";
import { Hash, Copy, Check, BookOpen } from "lucide-react";

export function SelectorHasher() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const trimmed = input.trim();
  const fullHash = trimmed
    ? keccak256(stringToBytes(trimmed))
    : "0x" + "0".repeat(64);
  const selector = trimmed ? computeSelector(input) : "0x00000000";

  const matchedPreset = PRESET_FUNCTIONS.find(
    (p) => p.signature.toLowerCase() === trimmed.toLowerCase() || p.selector.toLowerCase() === selector.toLowerCase()
  );

  const copy = () => {
    if (!trimmed) {
      toast.error("Please enter a function signature first");
      return;
    }
    navigator.clipboard.writeText(selector);
    setCopied(true);
    toast.success(`Copied selector: ${selector}`);
    setTimeout(() => setCopied(false), 1200);
  };

  const sampleSignatures = [
    "transfer(address,uint256)",
    "balanceOf(address)",
    "mint(address,uint256)",
    "add(uint256,uint256)",
    "approve(address,uint256)",
    "swapExactTokensForTokens(uint256,uint256,address[],address,uint256)",
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-text flex items-center gap-2">
          <Hash className="w-4 h-4 text-accent" />
          Real-Time Keccak-256 Selector Hasher
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Compute the exact 4-byte EVM function selector from any canonical Solidity function signature.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-card">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Normalized Function Signature (no spaces, canonical types)
          </label>
          <input
            type="text"
            placeholder="e.g. transfer(address,uint256)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Quick Click Samples */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-text-muted flex items-center gap-1">
            <BookOpen className="w-3 h-3" /> Quick Presets:
          </span>
          {sampleSignatures.map((sig) => (
            <button
              key={sig}
              onClick={() => setInput(sig)}
              className="text-[11px] font-mono text-text-secondary hover:text-text bg-bg border border-border hover:border-accent/40 px-2.5 py-1 rounded-md transition"
            >
              {sig}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-border">
          {/* 4-byte Selector Box */}
          <div className="bg-bg border border-accent/30 rounded-xl p-4 space-y-1">
            <span className="text-xs text-text-muted font-medium">4-Byte Function Selector</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-lg font-bold text-accent">
                {selector}
              </span>
              <button
                onClick={copy}
                disabled={!trimmed}
                className="flex items-center gap-1 text-xs text-text-secondary hover:text-text bg-card border border-border px-2.5 py-1 rounded-md transition disabled:opacity-30"
              >
                {copied ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Done" : "Copy"}</span>
              </button>
            </div>
            <span className="text-[10px] text-text-muted font-mono">bytes4(keccak256(...))</span>
          </div>

          {/* Full Hash Box */}
          <div className="sm:col-span-2 bg-bg border border-border rounded-xl p-4 space-y-1">
            <span className="text-xs text-text-muted font-medium">Full 32-Byte Keccak-256 Digest</span>
            <p className="font-mono text-xs text-text-secondary break-all leading-relaxed pt-1">
              <span className="text-accent font-bold">{fullHash.slice(0, 10)}</span>
              {fullHash.slice(10)}
            </p>
            {matchedPreset && (
              <p className="text-[11px] text-ok font-mono pt-1">
                ✓ Matched with registered {matchedPreset.category} preset
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
