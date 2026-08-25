"use client";

import { useState, useMemo } from "react";
import { PRESET_FUNCTIONS, CONTRACT_ADDRESSES } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { useDispatcher } from "../hooks/useDispatcher";
import { toast } from "sonner";
import { type Hex } from "viem";
import { Send, Play, Binary, Layers, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export function DispatcherPanel() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [params, setParams] = useState<Record<string, string>>({});
  const [rawMode, setRawMode] = useState(false);
  const [rawCalldata, setRawCalldata] = useState("");
  const [ethValue, setEthValue] = useState("0");

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
      toast.loading("Dispatching call to Router...", { id: "dispatch" });
      const val = ethValue && Number(ethValue) > 0 ? BigInt(Math.floor(Number(ethValue) * 1e18)) : 0n;
      await executeCalldata(calldata, val);
      toast.success("Transaction dispatched successfully!", { id: "dispatch" });
    } catch (err: any) {
      toast.error(err.message || "Execution reverted", { id: "dispatch" });
    }
  };

  const selectorHex = calldata.length >= 10 ? calldata.slice(0, 10) : "";
  const argsHex = calldata.length > 10 ? calldata.slice(10) : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input Builder */}
      <div className="border border-border rounded-xl bg-card p-5 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text">Calldata Assembly Builder</h3>
            <p className="text-[11px] text-text-secondary">Pack parameters and 4-byte selector</p>
          </div>
          <button
            onClick={() => setRawMode(!rawMode)}
            className="text-xs text-text-secondary hover:text-text bg-bg border border-border rounded-lg px-2.5 py-1.5 transition"
          >
            {rawMode ? "Switch to Form Preset" : "Switch to Raw Hex"}
          </button>
        </div>

        {!rawMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Select Facet Function Preset
              </label>
              <select
                value={presetIdx}
                onChange={(e) => {
                  setPresetIdx(Number(e.target.value));
                  setParams({});
                }}
                className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono text-text focus:outline-none focus:border-accent"
              >
                {PRESET_FUNCTIONS.map((fn, i) => (
                  <option key={fn.signature} value={i}>
                    {fn.category} · {fn.signature} ({fn.selector})
                  </option>
                ))}
              </select>
            </div>

            {preset.inputs.length > 0 ? (
              preset.inputs.map((input) => (
                <div key={input.name}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-text-secondary">
                      {input.name}
                    </label>
                    <span className="text-xs text-text-muted font-mono">{input.type}</span>
                  </div>
                  <input
                    type="text"
                    placeholder={input.placeholder}
                    value={params[input.name] || ""}
                    onChange={(e) => setParams((p) => ({ ...p, [input.name]: e.target.value }))}
                    className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted py-3 text-center border border-border rounded-lg bg-bg">
                No parameters required. Only 4-byte selector <code className="text-accent">{preset.selector}</code> will be dispatched.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Raw Calldata Payload (0x...)
            </label>
            <textarea
              rows={4}
              placeholder="0xa9059cbb000000000000..."
              value={rawCalldata}
              onChange={(e) => setRawCalldata(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Payable msg.value (ETH)
          </label>
          <input
            type="text"
            placeholder="0"
            value={ethValue}
            onChange={(e) => setEthValue(e.target.value)}
            className="w-full bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover py-3 rounded-lg transition disabled:opacity-40 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isExecuting ? "Executing Dispatch..." : "Send Transaction via Dispatcher"}</span>
        </button>
      </div>

      {/* Right: Real-time Calldata Breakdown & Trace */}
      <div className="border border-border rounded-xl bg-card p-5 space-y-5 flex flex-col justify-between shadow-sm">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-bold text-text">Calldata Memory Inspector</h3>
            <p className="text-[11px] text-text-secondary">EVM memory layout before transmission</p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-text-muted">Target Proxy Address</span>
              <p className="font-mono text-xs text-text-secondary mt-1 break-all bg-bg rounded-lg px-3 py-2 border border-border">
                {CONTRACT_ADDRESSES.dispatcher}
              </p>
            </div>

            <div>
              <span className="text-xs text-text-muted">Byte-Level Slicing</span>
              <div className="mt-1 bg-bg rounded-lg p-3 border border-border font-mono text-xs space-y-2 break-all">
                <div className="flex gap-2">
                  <span className="text-accent font-bold shrink-0">[0:4] Selector:</span>
                  <span className="text-text font-bold">{selectorHex || "0x..."}</span>
                </div>
                {argsHex && (
                  <div className="flex gap-2">
                    <span className="text-text-muted shrink-0">[4:] Encoded Args:</span>
                    <span className="text-text-secondary">{argsHex}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="text-xs text-text-muted flex items-center justify-between">
              <span>Total Calldata Size:</span>
              <span className="text-text font-mono font-semibold">
                {calldata.length > 2 ? (calldata.length - 2) / 2 : 0} bytes
              </span>
            </div>
          </div>
        </div>

        {/* Execution Output Box */}
        <div className="pt-4 border-t border-border">
          {result ? (
            <div className="bg-ok/10 border border-ok/30 rounded-lg p-3 text-xs text-ok font-mono break-all space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Execution Succeeded:</span>
              </div>
              <p>{result}</p>
            </div>
          ) : error ? (
            <div className="bg-err/10 border border-err/30 rounded-lg p-3 text-xs text-err font-mono break-all space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Execution Reverted:</span>
              </div>
              <p>{error}</p>
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-2">
              Ready. Choose function parameters and send transaction.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
