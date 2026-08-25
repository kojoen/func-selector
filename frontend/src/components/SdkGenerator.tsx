"use client";

import { useState } from "react";
import { PRESET_FUNCTIONS, type SelectorItem } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { toast } from "sonner";
import { type Hex } from "viem";
import { Code2, Copy, Check } from "lucide-react";

export function SdkGenerator({ routes }: { routes: SelectorItem[] }) {
  const [selectedSig, setSelectedSig] = useState<string>("transfer(address,uint256)");
  const [selectedLanguage, setSelectedLanguage] = useState<"viem" | "ethers" | "solidity">("viem");
  const [copied, setCopied] = useState(false);

  const matchedPreset = PRESET_FUNCTIONS.find((p) => p.signature === selectedSig);
  const selector = matchedPreset
    ? (matchedPreset.selector as Hex)
    : FunctionSelectorSDK.computeBytes4(selectedSig);

  const snippets = FunctionSelectorSDK.generateCodeSnippets(
    selectedSig,
    selector,
    matchedPreset?.inputs.map((i) => i.type) || []
  );

  const currentSnippet = snippets[selectedLanguage];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    toast.success("Code snippet copied to clipboard!");
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-text flex items-center gap-2">
          <Code2 className="w-4 h-4 text-accent" />
          Developer SDK & Code Generator
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Generate type-safe integration code in TypeScript (Viem / Wagmi), Ethers.js, and Solidity to interact with RouteX Dispatcher.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5 shadow-card">
        {/* Function Selector & Language Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Select Target Function
            </label>
            <select
              value={selectedSig}
              onChange={(e) => setSelectedSig(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text focus:outline-none focus:border-accent"
            >
              {PRESET_FUNCTIONS.map((p) => (
                <option key={p.signature} value={p.signature}>
                  {p.category} · {p.signature} ({p.selector})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Target Framework / Language
            </label>
            <div className="flex bg-bg border border-border p-1 rounded-lg">
              <button
                onClick={() => setSelectedLanguage("viem")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
                  selectedLanguage === "viem"
                    ? "bg-card text-accent shadow-sm border border-border"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Viem / Wagmi
              </button>
              <button
                onClick={() => setSelectedLanguage("ethers")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
                  selectedLanguage === "ethers"
                    ? "bg-card text-accent shadow-sm border border-border"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Ethers.js v6
              </button>
              <button
                onClick={() => setSelectedLanguage("solidity")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition ${
                  selectedLanguage === "solidity"
                    ? "bg-card text-accent shadow-sm border border-border"
                    : "text-text-secondary hover:text-text"
                }`}
              >
                Solidity Interface
              </button>
            </div>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative bg-bg border border-border rounded-xl p-4 font-mono text-xs overflow-x-auto">
          <button
            onClick={handleCopy}
            className="absolute top-3.5 right-3.5 flex items-center gap-1.5 text-xs text-text-secondary hover:text-text bg-card border border-border hover:border-accent/40 px-3 py-1.5 rounded-lg transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Code"}</span>
          </button>
          <pre className="text-text-secondary pt-6 pb-2 leading-relaxed">
            <code>{currentSnippet}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
