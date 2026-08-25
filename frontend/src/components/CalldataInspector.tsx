"use client";

import { useState, useMemo } from "react";
import { CONTRACT_ADDRESSES, PRESET_FUNCTIONS } from "../config/contracts";
import { FunctionSelectorSDK, type DisassembledCalldata } from "../lib/sdk";
import { sepoliaPublicClient } from "../hooks/useDispatcher";
import { toast } from "sonner";
import { type Hex } from "viem";
import { Binary, Play, Copy, Check, ShieldAlert, Sparkles } from "lucide-react";

export function CalldataInspector() {
  const [rawInput, setRawInput] = useState<string>(
    "0xa9059cbb00000000000000000000000054254040faf67f85e96617d3ec600248c4b3ad370000000000000000000000000000000000000000000000056bc75e2d63100000"
  );
  const [simulationResult, setSimulationResult] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copied, setCopied] = useState(false);

  const disassembled: DisassembledCalldata = useMemo(() => {
    return FunctionSelectorSDK.disassembleCalldata(rawInput);
  }, [rawInput]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1200);
  };

  const handleSimulate = async () => {
    if (!disassembled.isValid) {
      toast.error("Invalid calldata format");
      return;
    }

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      toast.loading("Simulating via eth_call on Sepolia Dispatcher...", { id: "sim" });
      const res = await sepoliaPublicClient.call({
        to: CONTRACT_ADDRESSES.dispatcher,
        data: rawInput.trim() as Hex,
      });

      if (res.data && res.data !== "0x") {
        setSimulationResult(`Success (Return Data: ${res.data})`);
        toast.success("Execution simulation succeeded!", { id: "sim" });
      } else {
        setSimulationResult("Success (Empty return / void)");
        toast.success("Execution simulation succeeded!", { id: "sim" });
      }
    } catch (err: any) {
      const decoded = FunctionSelectorSDK.decodeCustomError(err);
      setSimulationResult(`Reverted: ${decoded}`);
      toast.error(`Reverted: ${decoded}`, { id: "sim" });
    } finally {
      setIsSimulating(false);
    }
  };

  const loadPreset = (selector: string) => {
    const preset = PRESET_FUNCTIONS.find((p) => p.selector === selector);
    if (!preset) return;

    if (preset.name === "transfer") {
      setRawInput(
        "0xa9059cbb00000000000000000000000054254040faf67f85e96617d3ec600248c4b3ad370000000000000000000000000000000000000000000000056bc75e2d63100000"
      );
    } else if (preset.name === "add") {
      setRawInput(
        "0x771602f7000000000000000000000000000000000000000000000000000000000000002a0000000000000000000000000000000000000000000000000000000000000012"
      );
    } else {
      setRawInput(preset.selector);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <Binary className="w-4 h-4 text-accent" />
            EVM Calldata Disassembler & Simulation Studio
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Inspect raw byte-level transaction calldata, slice 32-byte parameter words, and simulate execution via <code className="text-accent font-mono bg-bg px-1 py-0.5 rounded">eth_call</code> on Sepolia.
          </p>
        </div>

        {/* Quick presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Load Preset:</span>
          <button
            onClick={() => loadPreset("0xa9059cbb")}
            className="text-xs font-mono text-text-secondary hover:text-text bg-bg border border-border px-2 py-1 rounded"
          >
            transfer()
          </button>
          <button
            onClick={() => loadPreset("0x771602f7")}
            className="text-xs font-mono text-text-secondary hover:text-text bg-bg border border-border px-2 py-1 rounded"
          >
            add()
          </button>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Raw Hex Calldata (msg.data)
          </label>
          <textarea
            rows={3}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="0x..."
            className="w-full bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span>
              Total Length: <strong className="text-text font-mono">{disassembled.totalBytes} bytes</strong>
            </span>
            <span>·</span>
            <span>
              Words: <strong className="text-text font-mono">{disassembled.chunks.length} parameters</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleCopy(rawInput)}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-text bg-bg border border-border px-3 py-2 rounded-lg transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
            <button
              onClick={handleSimulate}
              disabled={isSimulating || !disassembled.isValid}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent-hover px-4 py-2 rounded-lg transition disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? "Simulating..." : "Simulate Call (eth_call)"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Breakdown Cards */}
      {disassembled.isValid ? (
        <div className="space-y-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Byte-by-Byte Memory Decomposition
          </h4>

          {/* Selector Card */}
          <div className="bg-card border border-accent/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20">
                Offset [0:4]
              </span>
              <div>
                <span className="text-xs text-text-muted">4-Byte Function Selector:</span>
                <p className="font-mono text-sm font-bold text-text">{disassembled.selector}</p>
              </div>
            </div>

            {disassembled.knownSignature && (
              <div className="text-right">
                <span className="text-xs text-text-muted">Resolved Signature:</span>
                <p className="font-mono text-xs font-semibold text-accent">{disassembled.knownSignature}</p>
              </div>
            )}
          </div>

          {/* Parameter Chunks */}
          {disassembled.chunks.map((chunk, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-text-muted bg-bg px-2 py-1 rounded border border-border">
                  Offset [{chunk.offset}:{chunk.offset + 32}]
                </span>
                <div>
                  <span className="text-xs font-medium text-text-secondary">
                    Word #{idx + 1} ({chunk.typeGuess}):
                  </span>
                  <p className="font-mono text-xs text-text break-all mt-0.5">{chunk.hex}</p>
                </div>
              </div>

              <div className="md:text-right text-xs text-text-muted font-mono bg-bg px-2.5 py-1 rounded border border-border/60">
                {chunk.description}
              </div>
            </div>
          ))}

          {/* Simulation Output Card */}
          {simulationResult && (
            <div
              className={`p-4 rounded-xl border font-mono text-xs ${
                simulationResult.startsWith("Reverted")
                  ? "bg-err/10 border-err/30 text-err"
                  : "bg-ok/10 border-ok/30 text-ok"
              }`}
            >
              <div className="flex items-center gap-2 font-semibold mb-1">
                {simulationResult.startsWith("Reverted") ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Simulation Result:</span>
              </div>
              <p className="break-all">{simulationResult}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-err/10 border border-err/30 rounded-xl p-4 text-xs text-err font-mono">
          {disassembled.error}
        </div>
      )}
    </div>
  );
}
