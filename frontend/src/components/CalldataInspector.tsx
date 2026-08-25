"use client";

import { useState, useMemo } from "react";
import { CONTRACT_ADDRESSES, PRESET_FUNCTIONS } from "../config/contracts";
import { FunctionSelectorSDK, type DisassembledCalldata } from "../lib/sdk";
import { sepoliaPublicClient } from "../hooks/useDispatcher";
import { toast } from "sonner";
import { type Hex } from "viem";
import { Play, Copy, Check } from "lucide-react";

export function CalldataInspector() {
  const [rawInput, setRawInput] = useState<string>("");
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const disassembled: DisassembledCalldata = useMemo(() => {
    return FunctionSelectorSDK.disassembleCalldata(rawInput);
  }, [rawInput]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSimulate = async () => {
    if (!disassembled.isValid) { toast.error("Invalid calldata"); return; }
    setIsSimulating(true);
    setSimulationResult(null);
    try {
      const res = await sepoliaPublicClient.call({
        to: CONTRACT_ADDRESSES.dispatcher,
        data: rawInput.trim() as Hex,
      });
      setSimulationResult(res.data && res.data !== "0x"
        ? "Success · Return: " + res.data
        : "Success · void return");
      toast.success("Simulation succeeded");
    } catch (err: any) {
      const decoded = FunctionSelectorSDK.decodeCustomError(err);
      setSimulationResult("Reverted: " + decoded);
      toast.error("Reverted: " + decoded);
    } finally {
      setIsSimulating(false);
    }
  };

  const loadPreset = (selector: string) => {
    const preset = PRESET_FUNCTIONS.find((p) => p.selector === selector);
    if (!preset) return;
    if (preset.name === "transfer") {
      setRawInput("0xa9059cbb00000000000000000000000054254040faf67f85e96617d3ec600248c4b3ad370000000000000000000000000000000000000000000000056bc75e2d63100000");
    } else if (preset.name === "add") {
      setRawInput("0x771602f7000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000012");
    } else {
      setRawInput(preset.selector);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
            Calldata Disassembler
          </span>
          <div className="flex gap-1.5">
            {["0xa9059cbb", "0x771602f7"].map((sel) => (
              <button
                key={sel}
                onClick={() => loadPreset(sel)}
                className="text-[10px] font-mono text-text-muted hover:text-text-secondary bg-bg-raised border border-border px-2 py-0.5 rounded interactive"
              >
                {PRESET_FUNCTIONS.find((p) => p.selector === sel)?.name || sel}()
              </button>
            ))}
          </div>
        </div>

        <textarea
          rows={3}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste 0x... calldata"
          className="w-full bg-bg-raised border border-border rounded-lg p-3.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-muted font-mono">
            {disassembled.totalBytes} bytes · {disassembled.chunks.length} words
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(rawInput)}
              disabled={!rawInput}
              className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-secondary bg-bg-raised border border-border px-2.5 py-1.5 rounded-lg interactive disabled:opacity-20"
            >
              {copied ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
            <button
              onClick={handleSimulate}
              disabled={isSimulating || !disassembled.isValid}
              className="flex items-center gap-1 text-[11px] font-medium text-text-inverse bg-accent hover:bg-accent-hover px-3.5 py-1.5 rounded-lg interactive disabled:opacity-30 shadow-glow-sm"
            >
              <Play className="w-3 h-3" />
              {isSimulating ? "Running..." : "Simulate"}
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {disassembled.isValid && (
        <div className="space-y-2">
          {/* Selector */}
          <div className="bg-surface border border-accent/15 rounded-xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-accent bg-accent-soft px-2 py-0.5 rounded">[0:4]</span>
              <span className="font-mono text-sm font-medium text-text">{disassembled.selector}</span>
            </div>
            {disassembled.knownSignature && (
              <span className="font-mono text-xs text-accent">{disassembled.knownSignature}</span>
            )}
          </div>

          {/* Words */}
          {disassembled.chunks.map((chunk, idx) => (
            <div key={idx} className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-text-muted bg-bg-raised px-2 py-0.5 rounded shrink-0">
                  [{chunk.offset}:{chunk.offset + 32}]
                </span>
                <span className="font-mono text-xs text-text break-all">{chunk.hex}</span>
              </div>
              <span className="text-[11px] font-mono text-text-muted bg-bg-raised px-2 py-1 rounded shrink-0">
                {chunk.description}
              </span>
            </div>
          ))}

          {/* Sim result */}
          {simulationResult && (
            <div className={"rounded-xl px-4 py-3 font-mono text-xs break-all " + (
              simulationResult.startsWith("Reverted")
                ? "bg-err-muted border border-err/20 text-err"
                : "bg-ok-muted border border-ok/20 text-ok"
            )}>
              {simulationResult}
            </div>
          )}
        </div>
      )}

      {rawInput.trim() && !disassembled.isValid && (
        <div className="bg-err-muted border border-err/20 rounded-xl px-4 py-3 text-xs text-err font-mono">
          {disassembled.error}
        </div>
      )}
    </div>
  );
}
