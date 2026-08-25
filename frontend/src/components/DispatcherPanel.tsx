"use client";

import { useState, useMemo } from "react";
import { PRESET_FUNCTIONS, CONTRACT_ADDRESSES } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { useDispatcher } from "../hooks/useDispatcher";
import { toast } from "sonner";
import { type Hex } from "viem";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";

export function DispatcherPanel() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [params, setParams] = useState<Record<string, string>>({});
  const [rawMode, setRawMode] = useState(false);
  const [rawCalldata, setRawCalldata] = useState("");
  const [ethValue, setEthValue] = useState("");

  const preset = PRESET_FUNCTIONS[presetIdx];
  const { executeCalldata, isExecuting, result, error } = useDispatcher();

  const calldata: Hex = useMemo(() => {
    if (rawMode) {
      return rawCalldata.startsWith("0x") && rawCalldata.length >= 10
        ? (rawCalldata as Hex)
        : "0x";
    }
    try {
      const types = preset.inputs.map((i) => i.type);
      const values = preset.inputs.map((i) => {
        const v = params[i.name] || "";
        return i.type.startsWith("uint") ? BigInt(v || 0) : v;
      });
      return FunctionSelectorSDK.encodeCalldata(preset.selector as Hex, types, values);
    } catch {
      return (preset.selector as Hex) || "0x";
    }
  }, [rawMode, rawCalldata, presetIdx, params, preset]);

  const handleExecute = async () => {
    try {
      toast.loading("Dispatching...", { id: "dispatch" });
      const val = ethValue && Number(ethValue) > 0 ? BigInt(Math.floor(Number(ethValue) * 1e18)) : 0n;
      await executeCalldata(calldata, val);
      toast.success("Transaction confirmed", { id: "dispatch" });
    } catch (err: any) {
      toast.error(err.message || "Reverted", { id: "dispatch" });
    }
  };

  const selectorHex = calldata.length >= 10 ? calldata.slice(0, 10) : "";
  const argsHex = calldata.length > 10 ? calldata.slice(10) : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Builder */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
            Calldata Builder
          </span>
          <button
            onClick={() => setRawMode(!rawMode)}
            className="text-[11px] text-text-muted hover:text-text-secondary bg-bg-raised border border-border px-2.5 py-1 rounded-md interactive"
          >
            {rawMode ? "Form Mode" : "Raw Hex"}
          </button>
        </div>

        {!rawMode ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-text-muted mb-1.5">Function Preset</label>
              <select
                value={presetIdx}
                onChange={(e) => { setPresetIdx(Number(e.target.value)); setParams({}); }}
                className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text focus:outline-none focus:border-accent/50 interactive"
              >
                {PRESET_FUNCTIONS.map((fn, i) => (
                  <option key={fn.signature} value={i}>
                    {fn.category} · {fn.signature}
                  </option>
                ))}
              </select>
            </div>

            {preset.inputs.length > 0 ? (
              preset.inputs.map((input) => (
                <div key={input.name}>
                  <div className="flex justify-between mb-1">
                    <label className="text-[11px] text-text-muted">{input.name}</label>
                    <span className="text-[10px] text-text-muted font-mono">{input.type}</span>
                  </div>
                  <input
                    type="text"
                    placeholder={input.placeholder}
                    value={params[input.name] || ""}
                    onChange={(e) => setParams((p) => ({ ...p, [input.name]: e.target.value }))}
                    className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted py-3 text-center bg-bg-raised border border-border rounded-lg">
                No parameters — selector <code className="text-accent">{preset.selector}</code> only
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[11px] text-text-muted mb-1.5">Raw Calldata</label>
            <textarea
              rows={4}
              placeholder="0x..."
              value={rawCalldata}
              onChange={(e) => setRawCalldata(e.target.value)}
              className="w-full bg-bg-raised border border-border rounded-lg p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
            />
          </div>
        )}

        <div>
          <label className="block text-[11px] text-text-muted mb-1.5">msg.value (ETH)</label>
          <input
            type="text"
            placeholder="0.0"
            value={ethValue}
            onChange={(e) => setEthValue(e.target.value)}
            className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-text-inverse bg-accent hover:bg-accent-hover py-2.5 rounded-lg interactive disabled:opacity-30 shadow-glow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          {isExecuting ? "Executing..." : "Send Transaction"}
        </button>
      </div>

      {/* Right: Inspector */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
            Memory Layout
          </span>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-text-muted mb-1">Target</p>
              <p className="font-mono text-xs text-text-secondary bg-bg-raised border border-border rounded-lg px-3.5 py-2 break-all">
                {CONTRACT_ADDRESSES.dispatcher}
              </p>
            </div>

            <div className="bg-bg-raised border border-border rounded-lg p-3.5 font-mono text-xs space-y-1.5 break-all">
              <div className="flex gap-2">
                <span className="text-accent font-medium shrink-0">[0:4]</span>
                <span className="text-text">{selectorHex || "—"}</span>
              </div>
              {argsHex && (
                <div className="flex gap-2">
                  <span className="text-text-muted shrink-0">[4:]</span>
                  <span className="text-text-secondary">{argsHex}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-text-muted font-mono text-right">
              {calldata.length > 2 ? (calldata.length - 2) / 2 : 0} bytes
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-border">
          {result ? (
            <div className="bg-ok-muted border border-ok/20 rounded-lg p-3 text-xs text-ok font-mono break-all flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{result}</span>
            </div>
          ) : error ? (
            <div className="bg-err-muted border border-err/20 rounded-lg p-3 text-xs text-err font-mono break-all flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-1">Ready to dispatch</p>
          )}
        </div>
      </div>
    </div>
  );
}
