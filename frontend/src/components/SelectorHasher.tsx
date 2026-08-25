"use client";

import { useState } from "react";
import { computeSelector } from "../lib/utils";
import { PRESET_FUNCTIONS } from "../config/contracts";
import { keccak256, stringToBytes } from "viem";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";

export function SelectorHasher() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const trimmed = input.trim();
  const fullHash = trimmed ? keccak256(stringToBytes(trimmed)) : "0x" + "0".repeat(64);
  const selector = trimmed ? computeSelector(input) : "0x00000000";

  const matchedPreset = PRESET_FUNCTIONS.find(
    (p) => p.signature.toLowerCase() === trimmed.toLowerCase() || p.selector.toLowerCase() === selector.toLowerCase()
  );

  const copy = () => {
    if (!trimmed) return;
    navigator.clipboard.writeText(selector);
    setCopied(true);
    toast.success(`Copied: ${selector}`);
    setTimeout(() => setCopied(false), 1500);
  };

  const presets = [
    "transfer(address,uint256)",
    "balanceOf(address)",
    "mint(address,uint256)",
    "add(uint256,uint256)",
    "approve(address,uint256)",
  ];

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
          Keccak-256 Selector Hash
        </span>

        <input
          type="text"
          placeholder="transfer(address,uint256)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-bg-raised border border-border rounded-lg px-4 py-3 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
        />

        {/* Quick presets */}
        <div className="flex flex-wrap gap-1.5">
          {presets.map((sig) => (
            <button
              key={sig}
              onClick={() => setInput(sig)}
              className="text-[10px] font-mono text-text-muted hover:text-text-secondary bg-bg-raised border border-border hover:border-border-hover px-2 py-1 rounded interactive"
            >
              {sig}
            </button>
          ))}
        </div>

        {/* Output */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border">
          <div className="bg-bg-raised border border-accent/15 rounded-xl p-4">
            <p className="text-[10px] text-text-muted mb-1.5">4-Byte Selector</p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-base font-semibold text-accent">{selector}</span>
              <button
                onClick={copy}
                disabled={!trimmed}
                className="p-1 rounded text-text-muted hover:text-text interactive disabled:opacity-20"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="sm:col-span-2 bg-bg-raised border border-border rounded-xl p-4">
            <p className="text-[10px] text-text-muted mb-1.5">Full Keccak-256</p>
            <p className="font-mono text-[11px] text-text-secondary break-all leading-relaxed">
              <span className="text-accent">{fullHash.slice(0, 10)}</span>
              {fullHash.slice(10)}
            </p>
            {matchedPreset && (
              <p className="text-[10px] text-ok font-mono mt-1.5">
                ✓ Matches registered {matchedPreset.category} preset
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
