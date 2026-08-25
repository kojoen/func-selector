"use client";

import { useState } from "react";
import { PRESET_FUNCTIONS, type SelectorItem } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { toast } from "sonner";
import { type Hex } from "viem";
import { Copy, Check } from "lucide-react";

export function SdkGenerator({ routes }: { routes: SelectorItem[] }) {
  const [selectedSig, setSelectedSig] = useState<string>("transfer(address,uint256)");
  const [lang, setLang] = useState<"viem" | "ethers" | "solidity">("viem");
  const [copied, setCopied] = useState(false);

  const preset = PRESET_FUNCTIONS.find((p) => p.signature === selectedSig);
  const selector = preset ? (preset.selector as Hex) : FunctionSelectorSDK.computeBytes4(selectedSig);
  const snippets = FunctionSelectorSDK.generateCodeSnippets(selectedSig, selector, preset?.inputs.map((i) => i.type) || []);
  const code = snippets[lang];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
          Code Generator
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-text-muted mb-1.5">Function</label>
            <select
              value={selectedSig}
              onChange={(e) => setSelectedSig(e.target.value)}
              className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text focus:outline-none focus:border-accent/50 interactive"
            >
              {PRESET_FUNCTIONS.map((p) => (
                <option key={p.signature} value={p.signature}>
                  {p.category} · {p.signature}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-text-muted mb-1.5">Framework</label>
            <div className="flex bg-bg-raised border border-border p-0.5 rounded-lg">
              {(["viem", "ethers", "solidity"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={"flex-1 py-2 text-[11px] font-medium rounded-md interactive " + (
                    lang === l ? "bg-surface text-accent shadow-sm" : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  {l === "viem" ? "Viem" : l === "ethers" ? "Ethers.js" : "Solidity"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Code block */}
        <div className="relative bg-bg-raised border border-border rounded-xl p-4 font-mono text-xs overflow-x-auto">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 flex items-center gap-1 text-[10px] text-text-muted hover:text-text-secondary bg-surface border border-border px-2 py-1 rounded interactive"
          >
            {copied ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3" />}
            {copied ? "Done" : "Copy"}
          </button>
          <pre className="text-text-secondary leading-relaxed pt-4 pb-1">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
