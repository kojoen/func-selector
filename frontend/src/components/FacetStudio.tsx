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
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

export function FacetStudio() {
  const { address, isConnected, chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { executeCalldata, isExecuting } = useDispatcher();

  const [activeFacet, setActiveFacet] = useState<"token" | "calc">("token");

  // Token facet state - All empty by default (no hardcoded pre-filled values)
  const [balance, setBalance] = useState<string>("0");
  const [totalSupply, setTotalSupply] = useState<string>("0");
  const [isLoadingToken, setIsLoadingToken] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [mintAmount, setMintAmount] = useState("");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  // Calculator facet state - Empty by default
  const [calcOp, setCalcOp] = useState<"add" | "sub" | "mul" | "div" | "mod">("add");
  const [calcA, setCalcA] = useState("");
  const [calcB, setCalcB] = useState("");
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [isSimulatingCalc, setIsSimulatingCalc] = useState(false);

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  // Fetch Token State via Dispatcher using reliable Sepolia RPC
  const fetchTokenState = useCallback(async () => {
    setIsLoadingToken(true);
    try {
      // 1. Fetch Total Supply (selector 0x18160ddd)
      const totalRes = await sepoliaPublicClient.call({
        to: CONTRACT_ADDRESSES.dispatcher,
        data: "0x18160ddd",
      });
      if (totalRes.data && totalRes.data !== "0x") {
        const supplyVal = BigInt(totalRes.data);
        setTotalSupply(formatUnits(supplyVal, 18));
      }

      // 2. Fetch User Balance (selector 0x70a08231 + userAddress)
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
          const balVal = BigInt(balRes.data);
          setBalance(formatUnits(balVal, 18));
        }
      }
    } catch (err: any) {
      console.error("Error reading token facet on Sepolia:", err);
    } finally {
      setIsLoadingToken(false);
    }
  }, [address]);

  useEffect(() => {
    fetchTokenState();
  }, [fetchTokenState]);

  // Handle Token Mint
  const handleMint = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    const parsedAmount = Number(mintAmount);
    if (!mintAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive mint amount");
      return;
    }

    if (isWrongNetwork && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: sepolia.id });
      } catch {
        toast.error("Please switch your wallet to Sepolia Testnet");
        return;
      }
    }

    try {
      toast.loading("Minting tokens via Dispatcher (waiting for block confirmation)...", {
        id: "facet-action",
      });
      const amountWei = parseUnits(mintAmount, 18);
      const calldata = FunctionSelectorSDK.encodeCalldata(
        "0x40c10f19", // mint(address,uint256)
        ["address", "uint256"],
        [address as Address, amountWei]
      );

      const txHash = await executeCalldata(calldata, 0n);
      setLastTxHash(txHash || null);
      toast.success(`Successfully minted ${mintAmount} TEST tokens!`, {
        id: "facet-action",
      });
      setMintAmount("");
      await fetchTokenState();
    } catch (err: any) {
      toast.error(err.message || "Minting failed", { id: "facet-action" });
    }
  };

  // Handle Token Transfer
  const handleTransfer = async () => {
    if (!isAddress(transferTo)) {
      toast.error("Please enter a valid recipient address (0x...)");
      return;
    }
    const parsedAmount = Number(transferAmount);
    if (!transferAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid positive transfer amount");
      return;
    }

    if (isWrongNetwork && switchChainAsync) {
      try {
        await switchChainAsync({ chainId: sepolia.id });
      } catch {
        toast.error("Please switch your wallet to Sepolia Testnet");
        return;
      }
    }

    try {
      toast.loading("Transferring via Dispatcher (waiting for block confirmation)...", {
        id: "facet-action",
      });
      const amountWei = parseUnits(transferAmount, 18);
      const calldata = FunctionSelectorSDK.encodeCalldata(
        "0xa9059cbb", // transfer(address,uint256)
        ["address", "uint256"],
        [transferTo as Address, amountWei]
      );

      const txHash = await executeCalldata(calldata, 0n);
      setLastTxHash(txHash || null);
      toast.success(`Successfully transferred ${transferAmount} TEST tokens!`, { id: "facet-action" });
      setTransferTo("");
      setTransferAmount("");
      await fetchTokenState();
    } catch (err: any) {
      toast.error(err.message || "Transfer failed", { id: "facet-action" });
    }
  };

  // Handle Calculator Simulation & Execution
  const handleSimulateCalc = async () => {
    if (!calcA.trim() || !calcB.trim()) {
      toast.error("Please fill in both Input A and Input B");
      return;
    }

    setIsSimulatingCalc(true);
    setCalcResult(null);

    try {
      const opSelectors: Record<string, Hex> = {
        add: "0x771602f7",
        sub: "0xb67d77c5",
        mul: "0xc8a4ac9c",
        div: "0xa391c15b",
        mod: "0xf43f523a",
      };
      const sel = opSelectors[calcOp];
      const calldata = FunctionSelectorSDK.encodeCalldata(
        sel,
        ["uint256", "uint256"],
        [BigInt(calcA.trim()), BigInt(calcB.trim())]
      );

      const simRes = await sepoliaPublicClient.call({
        to: CONTRACT_ADDRESSES.dispatcher,
        data: calldata,
      });

      if (simRes.data && simRes.data !== "0x") {
        const decoded = BigInt(simRes.data).toString();
        setCalcResult(decoded);
        toast.success(`Calculation Result: ${decoded}`, { id: "calc-toast" });
      } else {
        toast.error("No return data received from Dispatcher");
      }
    } catch (err: any) {
      const errMsg = FunctionSelectorSDK.decodeCustomError(err);
      toast.error(`Execution Reverted: ${errMsg}`);
    } finally {
      setIsSimulatingCalc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Warning Banner if user is connected to wrong chain */}
      {isWrongNetwork && (
        <div className="bg-err/10 border border-err/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-err font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Your wallet is connected to a different network. Contracts are deployed on <strong>Sepolia Testnet</strong>.
            </span>
          </div>
          {switchChainAsync && (
            <button
              onClick={() => switchChainAsync({ chainId: sepolia.id })}
              className="font-semibold text-white bg-err hover:bg-err/90 px-3 py-1.5 rounded-lg transition shrink-0"
            >
              Switch to Sepolia
            </button>
          )}
        </div>
      )}

      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-text flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Live Facet Execution Studio
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Execute real on-chain smart contract facets routed dynamically through the Dispatcher on Sepolia.
          </p>
        </div>

        {/* Facet Switcher Tabs */}
        <div className="flex bg-card border border-border p-1 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveFacet("token")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeFacet === "token"
                ? "bg-accent text-white shadow-glow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>MockToken Facet (ERC-20)</span>
          </button>
          <button
            onClick={() => setActiveFacet("calc")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition ${
              activeFacet === "calc"
                ? "bg-accent text-white shadow-glow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>MockCalc Facet (Math)</span>
          </button>
        </div>
      </div>

      {/* ================= TOKEN FACET WORKSPACE ================= */}
      {activeFacet === "token" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Live State & Faucet */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text uppercase tracking-wider">
                Facet State (Sepolia)
              </span>
              <button
                onClick={fetchTokenState}
                disabled={isLoadingToken}
                className="text-text-secondary hover:text-accent p-1.5 rounded-lg hover:bg-bg transition"
                title="Refresh balances"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingToken ? "animate-spin text-accent" : ""}`} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-bg/80 border border-border rounded-lg p-3.5">
                <span className="text-xs text-text-muted">Your Wallet Balance</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-2xl font-bold text-accent">
                    {Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">TEST</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  Queried via selector: <code className="text-text">0x70a08231 (balanceOf)</code>
                </span>
              </div>

              <div className="bg-bg/80 border border-border rounded-lg p-3.5">
                <span className="text-xs text-text-muted">Total Circulating Supply</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono text-base font-semibold text-text">
                    {Number(totalSupply).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-xs text-text-secondary">TEST</span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  Queried via selector: <code className="text-text">0x18160ddd (totalSupply)</code>
                </span>
              </div>
            </div>

            {/* Test Faucet */}
            <div className="pt-3 border-t border-border space-y-2">
              <span className="text-xs font-medium text-text">Instant Test Faucet</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-28 bg-bg border border-border rounded-lg px-3 py-2 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
                <button
                  onClick={handleMint}
                  disabled={isExecuting || !isConnected || !mintAmount}
                  className="flex-1 text-xs font-semibold text-white bg-accent hover:bg-accent-hover py-2 rounded-lg transition disabled:opacity-40 shadow-glow-sm"
                >
                  {isExecuting ? "Minting..." : "Mint Test Tokens"}
                </button>
              </div>
              {!isConnected && (
                <p className="text-[11px] text-text-muted text-center pt-1">
                  Connect wallet on Sepolia to mint
                </p>
              )}
            </div>
          </div>

          {/* Card 2: Transfer Module */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 space-y-5 flex flex-col justify-between shadow-card">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text uppercase tracking-wider">
                  Execute Transfer via Router
                </span>
                <span className="text-[11px] font-mono text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                  transfer(address,uint256) · 0xa9059cbb
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Recipient Address (to)
                  </label>
                  <input
                    type="text"
                    placeholder="0xRecipientAddress..."
                    value={transferTo}
                    onChange={(e) => setTransferTo(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Amount (TEST)
                  </label>
                  <input
                    type="text"
                    placeholder="0.0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              {lastTxHash && (
                <div className="bg-bg border border-border rounded-lg p-2.5 flex items-center justify-between text-xs font-mono text-text-secondary">
                  <span>Last Confirmed Transaction:</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-accent hover:underline"
                  >
                    <span>{lastTxHash.slice(0, 14)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-text-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-ok shrink-0" />
                  <span>
                    Delegated to <code className="text-text font-mono">MockToken.sol</code>
                  </span>
                </div>

                <button
                  onClick={handleTransfer}
                  disabled={isExecuting || !transferTo || !transferAmount || !isConnected}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover px-6 py-2.5 rounded-lg transition disabled:opacity-40 shadow-glow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isExecuting ? "Executing..." : "Send Transfer"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CALCULATOR FACET WORKSPACE ================= */}
      {activeFacet === "calc" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <span className="text-xs font-semibold text-text uppercase tracking-wider">
                EVM Pure Math Execution Facet
              </span>
              <p className="text-xs text-text-secondary mt-0.5">
                Executes arithmetic operations on Sepolia via stateless Pure functions delegated by the Dispatcher.
              </p>
            </div>
            <span className="text-xs font-mono text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
              Contract: MockCalc.sol
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            {/* Param A */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Input A (uint256)
              </label>
              <input
                type="text"
                value={calcA}
                placeholder="e.g. 42"
                onChange={(e) => setCalcA(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>

            {/* Operation Selector */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Operator
              </label>
              <select
                value={calcOp}
                onChange={(e) => setCalcOp(e.target.value as any)}
                className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text focus:outline-none focus:border-accent"
              >
                <option value="add">+ Add (0x771602f7)</option>
                <option value="sub">- Subtract (0xb67d77c5)</option>
                <option value="mul">× Multiply (0xc8a4ac9c)</option>
                <option value="div">÷ Divide (0xa391c15b)</option>
                <option value="mod">% Modulo (0xf43f523a)</option>
              </select>
            </div>

            {/* Param B */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Input B (uint256)
              </label>
              <input
                type="text"
                value={calcB}
                placeholder="e.g. 18"
                onChange={(e) => setCalcB(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-sm font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Action & Result */}
          <div className="bg-bg border border-border rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-muted font-medium">On-chain Result:</span>
              <span className="font-mono text-2xl font-bold text-accent">
                {calcResult !== null ? calcResult : "--"}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleSimulateCalc}
                disabled={isSimulatingCalc || !calcA.trim() || !calcB.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-accent hover:bg-accent-hover px-6 py-3 rounded-lg transition disabled:opacity-40 shadow-glow-sm"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>{isSimulatingCalc ? "Calculating..." : "Calculate On-Chain (eth_call)"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
