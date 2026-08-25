"use client";

import { useState } from "react";
import { ArrowRight, Layers, Zap, Shield, ChevronDown, ChevronUp, Terminal } from "lucide-react";

export function ArchitectureHero() {
  const [showDiagram, setShowDiagram] = useState(false);

  return (
    <div className="border border-border/80 rounded-xl bg-card/60 p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
              EVM Architecture Standard
            </span>
            <span className="text-xs text-text-muted">Solidity ^0.8.24</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-text">
            Modular Function Selector & Calldata Router
          </h2>
          <p className="text-sm text-text-secondary mt-1 max-w-2xl leading-relaxed">
            RouteX eliminates EVM contract size limits (EIP-170) and enables seamless zero-downtime micro-upgrades by routing 4-byte calldata selectors to modular facet contracts via inline-assembly <code className="text-accent font-mono bg-bg px-1 py-0.5 rounded">delegatecall</code>.
          </p>
        </div>

        <button
          onClick={() => setShowDiagram(!showDiagram)}
          className="self-start md:self-center flex items-center gap-2 text-xs font-medium text-text bg-bg hover:bg-tag-bg border border-border px-3.5 py-2 rounded-lg transition"
        >
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span>{showDiagram ? "Hide Pipeline" : "View Routing Flow"}</span>
          {showDiagram ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border/60">
        <div className="bg-bg/60 border border-border/60 rounded-lg p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-text">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>Single Entrypoint Gateway</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Users & dApps interact only with the immutable Dispatcher. Calldata is sliced at runtime and delegated dynamically.
          </p>
        </div>

        <div className="bg-bg/60 border border-border/60 rounded-lg p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-text">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>O(1) Facet Registry</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Active selectors are stored in an enumerable registry using swap-and-pop arrays for zero-gas-leak function swapping.
          </p>
        </div>

        <div className="bg-bg/60 border border-border/60 rounded-lg p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-text">
            <Shield className="w-3.5 h-3.5 text-accent" />
            <span>Atomic Storage Context</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            All execution persists in the Dispatcher’s storage space. Facets act as stateless execution engines.
          </p>
        </div>
      </div>

      {/* Interactive Visual Execution Pipeline */}
      {showDiagram && (
        <div className="bg-bg border border-border rounded-lg p-4 font-mono text-xs text-text-secondary space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="font-semibold text-text flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-accent" />
              Runtime EVM Calldata Pipeline
            </span>
            <span className="text-[11px] text-text-muted">msg.data [0:4] = bytes4 selector</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-card border border-border rounded space-y-1">
              <span className="text-[10px] text-accent font-bold uppercase">Step 1: Inbound</span>
              <p className="text-text font-semibold">User Transaction</p>
              <p className="text-[11px] text-text-muted">Sends raw calldata + optional msg.value to Dispatcher address.</p>
            </div>

            <div className="p-3 bg-card border border-border rounded space-y-1">
              <span className="text-[10px] text-accent font-bold uppercase">Step 2: Slice & Lookup</span>
              <p className="text-text font-semibold">Fallback Handler</p>
              <p className="text-[11px] text-text-muted">Extracts msg.sig (`msg.data[:4]`) and queries FunctionRegistry.</p>
            </div>

            <div className="p-3 bg-card border border-border rounded space-y-1">
              <span className="text-[10px] text-accent font-bold uppercase">Step 3: Delegatecall</span>
              <p className="text-text font-semibold">Facet Execution</p>
              <p className="text-[11px] text-text-muted">Executes logic in target contract (MockToken / MockCalc) with caller state.</p>
            </div>

            <div className="p-3 bg-card border border-border rounded space-y-1">
              <span className="text-[10px] text-accent font-bold uppercase">Step 4: Bubble Up</span>
              <p className="text-text font-semibold">Assembly Return</p>
              <p className="text-[11px] text-text-muted">Copies returndata / revert bytes and returns directly to caller.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
