"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { FunctionSelectorSDK } from "../lib/sdk";
import { useDispatcher, sepoliaPublicClient } from "../hooks/useDispatcher";
import { toast } from "sonner";
import { type Hex, type Address, isAddress, formatUnits, parseUnits } from "viem";
import {
  Coins,
  Calculator,
  RefreshCw,
  Send,
  AlertTriangle,
  ExternalLink,
  Droplets,
  ArrowUpRight,
} from "lucide-react";

export function FacetStudio() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { executeCalldata, isExecuting } = useDispatcher();

  const [activeFacet, setActiveFacet] = useState<"token" | "calc">("token");

  const [balance, setBalance] = useState<string>("0");
  const [totalSupply, setTotalSupply] = useState<string>("0");
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const [calcOp, setCalcOp] = useState<"add" | "sub" | "mul" | "div" | "mod">("add");
  const [calcA, setCalcA] = useState("");
  const [calcB, setCalcB] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [isSimulatingCalc, setIsSimulatingCalc] = useState(false);

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  const fetchTokenState = useCallback(async () => {
    setIsLoadingToken(true);
    try {
      const totalRes = await sepoliaPublicClient.call({
        to: CONTRACT_ADDRESSES.dispatcher,
        data: "0x18160ddd",
      });
      if (totalRes.data && totalRes.data !== "0x") {
        setTotalSupply(formatUnits(BigInt(totalRes.data), 18));
      }
      if (address) {
        const balCalldata = FunctionSelectorSDK.encodeCalldata(
          "0x70a08231",
          ["address"],
          [address as Address]
        );
        const balRes = await sepoliaPublicClient.call({
          to: CONTRACT_ADDRESSES.dispatcher,
          data: balCalldata,
        });
        if (balRes.data && balRes.data !== "0x") {
          setBalance(formatUnits(BigInt(balRes.data), 18));
        }
      }
    } catch (err: any) {
      console.error("Error reading token facet:", err);
    } finally {
      setIsLoadingToken(false);
    }
  }, [address]);

  useEffect(() => {
    fetchTokenState();
  }, [fetchTokenState]);

  const handleMint = async () => {
    if (!address) { toast.error("Connect wallet first"); return; }
    const n = Number(mintAmount);
    if (!mintAmount || isNaN(n) || n <= 0) { toast.error("Enter a valid amount"); return; }
    if (isWrongNetwork && switchChainAsync) {
      try { await switchChainAsync({ chainId: sepolia.id }); } catch { toast.error("Switch to Sepolia"); return; }
    }
    try {
      toast.loading("Minting tokens...", { id: "facet" });
      const calldata = FunctionSelectorSDK.encodeCalldata(
        "0x40c10f19", ["address", "uint256"], [address as Address, parseUnits(mintAmount, 18)]
      );
      const txHash = await executeCalldata(calldata, 0n);
      setLastTxHash(txHash || null);
      toast.success(`Minted ${mintAmount} TEST`, { id: "facet" });
      setMintAmount("");
      await fetchTokenState();
    } catch (err: any) {
      toast.error(err.message || "Mint failed", { id: "facet" });
    }
  };

  const handleTransfer = async () => {
    if (!isAddress(transferTo)) { toast.error("Invalid recipient address"); return; }
    const n = Number(transferAmount);
    if (!transferAmount || isNaN(n) || n <= 0) { toast.error("Enter a valid amount"); return; }
    if (isWrongNetwork && switchChainAsync) {
      try { await switchChainAsync({ chainId: sepolia.id }); } catch { toast.error("Switch to Sepolia"); return; }
    }
    try {
      toast.loading("Transferring tokens...", { id: "facet" });
      const calldata = FunctionSelectorSDK.encodeCalldata(
        "0xa9059cbb", ["address", "uint256"], [transferTo as Address, parseUnits(transferAmount, 18)]
      );
      const txHash = await executeCalldata(calldata, 0n);
      setLastTxHash(txHash || null);
      toast.success(`Transferred ${transferAmount} TEST`, { id: "facet" });
      setTransferTo("");
      setTransferAmount("");
      await fetchTokenState();
    } catch (err: any) {
      toast.error(err.message || "Transfer failed", { id: "facet" });
    }
  };

  const handleCalc = async () => {
    if (!calcA.trim() || !calcB.trim()) { toast.error("Fill in both inputs"); return; }
    setIsSimulatingCalc(true);
    setCalcResult(null);
    try {
      const sels: Record<string, Hex> = {
        add: "0x771602f7", sub: "0xb67d77c5", mul: "0xc8a4ac9c", div: "0xa391c15b", mod: "0xf43f523a",
      };
      const calldata = FunctionSelectorSDK.encodeCalldata(
        sels[calcOp], ["uint256", "uint256"], [BigInt(calcA.trim()), BigInt(calcB.trim())]
      );
      const res = await sepoliaPublicClient.call({ to: CONTRACT_ADDRESSES.dispatcher, data: calldata });
      if (res.data && res.data !== "0x") {
        const val = BigInt(res.data).toString();
        setCalcResult(val);
        toast.success(`Result: ${val}`);
      }
    } catch (err: any) {
      toast.error(FunctionSelectorSDK.decodeCustomError(err));
    } finally {
      setIsSimulatingCalc(false);
    }
  };

  const opSymbols: Record<string, string> = { add: "+", sub: "−", mul: "×", div: "÷", mod: "%" };

  return (
    <div className="space-y-5">
      {/* Wrong network */}
      {isWrongNetwork && (
        <div className="bg-err-muted border border-err/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-err">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Wrong network. Contracts are on <strong>Sepolia</strong>.</span>
          </div>
          {switchChainAsync && (
            <button
              onClick={() => switchChainAsync({ chainId: sepolia.id })}
              className="text-xs font-medium text-white bg-err/80 hover:bg-err px-3 py-1.5 rounded-lg interactive shrink-0"
            >
              Switch Network
            </button>
          )}
        </div>
      )}

      {/* Facet tabs */}
      <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 w-fit">
        {([
          { key: "token" as const, label: "ERC-20 Token", icon: Coins },
          { key: "calc" as const, label: "Math Calculator", icon: Calculator },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveFacet(key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg interactive ${
              activeFacet === key
                ? "bg-accent text-text-inverse shadow-glow-sm"
                : "text-text-secondary hover:text-text hover:bg-surface-hover"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── TOKEN FACET ── */}
      {activeFacet === "token" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Left: Balance & Mint */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                Token State
              </span>
              <button
                onClick={fetchTokenState}
                disabled={isLoadingToken}
                className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-surface-hover interactive"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingToken ? "animate-spin text-accent" : ""}`} />
              </button>
            </div>

            {/* Balance */}
            <div className="space-y-3">
              <div className="bg-bg-raised border border-border rounded-xl p-4">
                <p className="text-[11px] text-text-muted mb-1">Your Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold text-text">
                    {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                  <span className="text-xs text-text-muted font-medium">TEST</span>
                </div>
                <p className="text-[10px] font-mono text-text-muted mt-2">
                  0x70a08231 · balanceOf
                </p>
              </div>

              <div className="bg-bg-raised border border-border rounded-xl p-4">
                <p className="text-[11px] text-text-muted mb-1">Total Supply</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-medium text-text-secondary">
                    {Number(totalSupply).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[11px] text-text-muted">TEST</span>
                </div>
              </div>
            </div>

            {/* Mint */}
            <div className="pt-4 border-t border-border space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-teal" />
                <span className="text-xs font-medium text-text">Test Faucet</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="Amount"
                  className="flex-1 bg-bg-raised border border-border rounded-lg px-3 py-2 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
                />
                <button
                  onClick={handleMint}
                  disabled={isExecuting || !isConnected || !mintAmount}
                  className="text-xs font-medium text-text-inverse bg-accent hover:bg-accent-hover px-4 py-2 rounded-lg interactive disabled:opacity-30 shadow-glow-sm"
                >
                  {isExecuting ? "Minting..." : "Mint"}
                </button>
              </div>
              {!isConnected && (
                <p className="text-[11px] text-text-muted">Connect wallet to mint</p>
              )}
            </div>
          </div>

          {/* Right: Transfer */}
          <div className="lg:col-span-3 bg-surface border border-border rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
                  Transfer
                </span>
                <span className="text-[10px] font-mono text-accent/70 bg-accent-soft border border-accent/15 px-2 py-0.5 rounded">
                  0xa9059cbb
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-text-muted mb-1.5">Recipient</label>
                  <input
                    type="text"
                    placeholder="0x..."
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-text-muted mb-1.5">Amount</label>
                  <input
                    type="text"
                    placeholder="0.0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-5 mt-5 border-t border-border">
              {lastTxHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[11px] font-mono text-accent hover:underline"
                >
                  <span>tx: {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-6)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                onClick={handleTransfer}
                disabled={isExecuting || !transferTo || !transferAmount || !isConnected}
                className="w-full flex items-center justify-center gap-2 text-xs font-medium text-text-inverse bg-accent hover:bg-accent-hover py-2.5 rounded-lg interactive disabled:opacity-30 shadow-glow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                {isExecuting ? "Sending..." : "Send Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CALCULATOR FACET ── */}
      {activeFacet === "calc" && (
        <div className="bg-surface border border-border rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">
              On-Chain Arithmetic
            </span>
            <span className="text-[10px] font-mono text-text-muted bg-bg-raised border border-border px-2 py-0.5 rounded">
              MockCalc.sol · Pure Functions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="block text-[11px] text-text-muted mb-1.5">Value A</label>
              <input
                type="text"
                value={calcA}
                placeholder="0"
                onChange={(e) => setCalcA(e.target.value)}
                className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
              />
            </div>

            <select
              value={calcOp}
              onChange={(e) => setCalcOp(e.target.value as any)}
              className="bg-bg-raised border border-border rounded-lg px-3 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-accent/50 interactive"
            >
              <option value="add">+ Add</option>
              <option value="sub">− Sub</option>
              <option value="mul">× Mul</option>
              <option value="div">÷ Div</option>
              <option value="mod">% Mod</option>
            </select>

            <div>
              <label className="block text-[11px] text-text-muted mb-1.5">Value B</label>
              <input
                type="text"
                value={calcB}
                placeholder="0"
                onChange={(e) => setCalcB(e.target.value)}
                className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
              />
            </div>
          </div>

          {/* Result */}
          <div className="flex items-center justify-between bg-bg-raised border border-border rounded-xl px-5 py-4">
            <div>
              <p className="text-[11px] text-text-muted mb-0.5">Result</p>
              <span className="font-mono text-xl font-semibold text-text">
                {calcResult !== null ? calcResult : "—"}
              </span>
            </div>
            <button
              onClick={handleCalc}
              disabled={isSimulatingCalc || !calcA.trim() || !calcB.trim()}
              className="flex items-center gap-1.5 text-xs font-medium text-text-inverse bg-accent hover:bg-accent-hover px-5 py-2.5 rounded-lg interactive disabled:opacity-30 shadow-glow-sm"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              {isSimulatingCalc ? "Running..." : "Execute"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
