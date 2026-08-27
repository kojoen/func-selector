"use client";

import { useState, useMemo, useEffect } from "react";
import { PRESET_FUNCTIONS, CONTRACT_ADDRESSES } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { useDispatcher, sepoliaPublicClient } from "../hooks/useDispatcher";
import { toast } from "sonner";
import { type Hex } from "viem";
import { Send, Play, AlertCircle, CheckCircle2, ExternalLink, Sparkles } from "lucide-react";

export function DispatcherPanel() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [params, setParams] = useState<Record<string, string>>({});
  const [rawMode, setRawMode] = useState(false);
  const [rawCalldata, setRawCalldata] = useState("");
  const [ethValue, setEthValue] = useState("");
  const [livePreview, setLivePreview] = useState<string | null>(null);

  const preset = PRESET_FUNCTIONS[presetIdx];
  const { simulateCalldata, executeCalldata, isExecuting, resultData, error } = useDispatcher();

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

  // Live non-blocking preview for pure/view calls
  useEffect(() => {
    let active = true;
    if (calldata.length >= 10 && (preset?.category === "MockCalc" || preset?.name.startsWith("balance") || preset?.name === "totalSupply")) {
      sepoliaPublicClient
        .call({ to: CONTRACT_ADDRESSES.dispatcher, data: calldata })
        .then((res) => {
          if (active && res.data && res.data !== "0x") {
            try {
              setLivePreview(BigInt(res.data).toString());
            } catch {
              setLivePreview(res.data);
            }
          }
        })
        .catch(() => {
          if (active) setLivePreview(null);
        });
    } else {
      setLivePreview(null);
    }
    return () => {
      active = false;
    };
  }, [calldata, preset]);

  const handleSimulate = async () => {
    try {
      toast.loading("Simulating via eth_call on Dispatcher...", { id: "dispatch-sim" });
      const val = ethValue && Number(ethValue) > 0 ? BigInt(Math.floor(Number(ethValue) * 1e18)) : 0n;
      await simulateCalldata(calldata, val);
      toast.success("Simulation completed!", { id: "dispatch-sim" });
    } catch (err: any) {
      toast.error(err.message || "Simulation failed", { id: "dispatch-sim" });
    }
  };

  const handleExecute = async () => {
    try {
      toast.loading("Dispatching on-chain transaction...", { id: "dispatch" });
      const val = ethValue && Number(ethValue) > 0 ? BigInt(Math.floor(Number(ethValue) * 1e18)) : 0n;
      await executeCalldata(calldata, val);
      toast.success("Transaction confirmed on-chain!", { id: "dispatch" });
    } catch (err: any) {
      toast.error(err.message || "Execution reverted", { id: "dispatch" });
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
                    {fn.category} · {fn.signature} ({fn.selector})
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

        <div className="flex gap-2.5 pt-1">
          <button
            onClick={handleSimulate}
            disabled={isExecuting}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text bg-bg-raised border border-border hover:border-border-hover py-2.5 rounded-lg interactive disabled:opacity-30"
          >
            <Play className="w-3.5 h-3.5 text-accent" />
            <span>{isExecuting ? "Simulating..." : "Simulate (eth_call)"}</span>
          </button>
          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-text-inverse bg-accent hover:bg-accent-hover py-2.5 rounded-lg interactive disabled:opacity-30 shadow-glow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isExecuting ? "Sending..." : "Send Transaction"}</span>
          </button>
        </div>
      </div>

      {/* Right: Inspector & Output */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
              Memory Layout & Output
            </span>
            {livePreview !== null && (
              <span className="text-[10px] font-mono text-accent bg-accent-soft px-2 py-0.5 rounded border border-accent/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Live Return: {livePreview}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-[10px] text-text-muted mb-1">Target Entrypoint</p>
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

        {/* Execution Output Card */}
        <div className="pt-3 border-t border-border">
          {resultData ? (
            <div className="bg-ok-muted border border-ok/20 rounded-xl p-4 text-xs font-mono text-text space-y-2.5">
              <div className="flex items-center gap-2 text-ok font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Execution Succeeded</span>
              </div>

              {/* Prominent Decoded Output */}
              {resultData.output !== undefined && (
                <div className="bg-bg-raised border border-ok/30 rounded-lg p-3 space-y-1">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider">Computed Return Output:</p>
                  <p className="text-xl font-bold font-mono text-ok">{resultData.output}</p>
                </div>
              )}

              {/* Transaction Receipt Link if sent on-chain */}
              {resultData.txHash && (
                <div className="bg-bg-raised border border-border rounded-lg p-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-text-secondary">
                    {resultData.blockNumber ? `Block #${resultData.blockNumber}` : "Pending on-chain"}
                  </span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${resultData.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-accent hover:underline"
                  >
                    <span>{resultData.txHash.slice(0, 10)}...{resultData.txHash.slice(-6)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : error ? (
            <div className="bg-err-muted border border-err/20 rounded-lg p-3 text-xs text-err font-mono break-all flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Execution Reverted:</p>
                <p>{error}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-2">
              Ready. Click <strong>Simulate (eth_call)</strong> to read result or <strong>Send Transaction</strong> to write on-chain.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
