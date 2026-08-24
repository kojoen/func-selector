"use client";

import { useState } from "react";
import { computeSelector } from "../lib/utils";
import { keccak256, stringToBytes } from "viem";
import { toast } from "sonner";

export function SelectorHasher() {
  const [input, setInput] = useState("transfer(address,uint256)");
  const [copied, setCopied] = useState(false);

  const trimmed = input.trim();
  const fullHash = trimmed
    ? keccak256(stringToBytes(trimmed))
    : "0x" + "0".repeat(64);
  const selector = trimmed ? computeSelector(input) : "0x00000000";

  const copy = () => {
    navigator.clipboard.writeText(selector);
    setCopied(true);
    toast.success(`Copied: ${selector}`);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="border border-border rounded bg-card p-5 space-y-5 max-w-2xl">
      <h3 className="text-sm font-semibold text-text">Selector Hasher</h3>

      <div>
        <label className="block text-xs font-medium text-text-secondary mb-1">
          Function Signature
        </label>
        <input
          type="text"
          placeholder="balanceOf(address)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border border-border rounded px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/60"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Selector */}
        <div className="bg-bg border border-border rounded p-3 space-y-1">
          <span className="text-xs text-text-muted">4-byte selector</span>
          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-semibold text-accent">
              {selector}
            </span>
            <button
              onClick={copy}
              className="text-xs text-text-secondary hover:text-text transition"
            >
              {copied ? "done" : "copy"}
            </button>
          </div>
        </div>

        {/* Full hash */}
        <div className="sm:col-span-2 bg-bg border border-border rounded p-3 space-y-1">
          <span className="text-xs text-text-muted">Full keccak256</span>
          <p className="font-mono text-xs text-text-secondary break-all leading-relaxed">
            <span className="text-accent font-medium">{fullHash.slice(0, 10)}</span>
            {fullHash.slice(10)}
          </p>
        </div>
      </div>
    </div>
  );
}
