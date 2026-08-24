"use client";

import { useState, useMemo } from "react";
import { PRESET_FUNCTIONS, CONTRACT_ADDRESSES } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { useDispatcher } from "../hooks/useDispatcher";
import { toast } from "sonner";
import { type Hex } from "viem";

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
      toast.loading("Dispatching...", { id: "dispatch" });
      const val = ethValue && Number(ethValue) > 0 ? BigInt(Math.floor(Number(ethValue) * 1e18)) : 0n;
      await executeCalldata(calldata, val);
      toast.success("Transaction sent", { id: "dispatch" });
    } catch (err: any) {
      toast.error(err.message || "Reverted", { id: "dispatch" });
    }
  };

  const selectorHex = calldata.length >= 10 ? calldata.slice(0, 10) : "";
  const argsHex = calldata.length > 10 ? calldata.slice(10) : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input */}
      <div className="border border-border rounded bg-card p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">Build Calldata</h3>
          <button
            onClick={() => setRawMode(!rawMode)}
            className="text-xs text-text-secondary hover:text-text border border-border rounded px-2.5 py-1 transition"
          >
            {rawMode ? "Preset" : "Raw Hex"}
          </button>
        </div>

        {!rawMode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Function
              </label>
              <select
                value={presetIdx}
                onChange={(e) => {
                  setPresetIdx(Number(e.target.value));
                  setParams({});
                }}
                className="w-full border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent/60 bg-card"
              >
                {PRESET_FUNCTIONS.map((fn, i) => (
                  <option key={fn.signature} value={i}>
                    {fn.category} / {fn.signature}
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
                    className="w-full border border-border rounded px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/60"
                  />
                </div>
              ))
            ) : (
              <p className="text-xs text-text-muted py-3 text-center border border-border rounded bg-bg">
                No arguments. Only the 4-byte selector will be sent.
              </p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Raw Calldata (hex)
            </label>
            <textarea
              rows={3}
              placeholder="0xa9059cbb000000000000..."
              value={rawCalldata}
              onChange={(e) => setRawCalldata(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/60"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            msg.value (ETH)
          </label>
          <input
            type="text"
            placeholder="0"
            value={ethValue}
            onChange={(e) => setEthValue(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/60"
          />
        </div>

        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="w-full text-sm font-medium text-white bg-accent hover:bg-accent-hover py-2.5 rounded transition disabled:opacity-40"
        >
          {isExecuting ? "Sending..." : "Send Transaction"}
        </button>
      </div>

      {/* Right: Calldata inspector & result */}
      <div className="border border-border rounded bg-card p-5 space-y-5 flex flex-col">
        <h3 className="text-sm font-semibold text-text">Calldata Inspector</h3>

        <div className="space-y-3 flex-1">
          <div>
            <span className="text-xs text-text-muted">Target</span>
            <p className="font-mono text-xs text-text-secondary mt-0.5 break-all bg-bg rounded px-3 py-2 border border-border">
              {CONTRACT_ADDRESSES.dispatcher}
            </p>
          </div>

          <div>
            <span className="text-xs text-text-muted">Byte breakdown</span>
            <div className="mt-0.5 bg-bg rounded px-3 py-2.5 border border-border font-mono text-xs space-y-1.5 break-all">
              <div className="flex gap-2">
                <span className="text-accent font-medium shrink-0">[0:4]</span>
                <span className="text-text">{selectorHex || "0x..."}</span>
              </div>
              {argsHex && (
                <div className="flex gap-2">
                  <span className="text-text-muted shrink-0">[4:]</span>
                  <span className="text-text-secondary">{argsHex}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <span className="text-xs text-text-muted">
              Total: {calldata.length > 2 ? (calldata.length - 2) / 2 : 0} bytes
            </span>
          </div>
        </div>

        {/* Result / Error */}
        <div className="pt-3 border-t border-border">
          {result ? (
            <div className="bg-ok/5 border border-ok/20 rounded px-3 py-2 text-xs text-ok font-mono break-all">
              {result}
            </div>
          ) : error ? (
            <div className="bg-err/5 border border-err/20 rounded px-3 py-2 text-xs text-err font-mono break-all">
              {error}
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-2">
              Ready. Waiting for transaction.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
