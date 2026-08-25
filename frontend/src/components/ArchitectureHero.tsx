"use client";

import { useState } from "react";
import { Layers, Zap, Shield, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";

const STEPS = [
  { step: "01", title: "Inbound Call", desc: "Raw calldata sent to single Dispatcher address" },
  { step: "02", title: "Selector Slice", desc: "msg.sig extracted — first 4 bytes of calldata" },
  { step: "03", title: "Registry Lookup", desc: "Selector mapped to facet implementation address" },
  { step: "04", title: "Delegatecall", desc: "Facet executes in Dispatcher's storage context" },
];

export function ArchitectureHero() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="space-y-5">
      {/* Title row */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-text">
            Modular Function Selector Router
          </h1>
          <span className="text-[10px] font-mono text-text-muted bg-surface border border-border px-2 py-0.5 rounded">
            EIP-2535 Inspired
          </span>
        </div>
        <p className="text-[13px] text-text-secondary max-w-2xl leading-relaxed">
          Route 4-byte calldata selectors to modular facet contracts via{" "}
          <code className="text-accent font-mono text-xs">delegatecall</code>.
          Bypass 24KB contract limits. Enable zero-downtime upgrades.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, title: "Single Entrypoint", desc: "One immutable address for all function calls" },
          { icon: Layers, title: "O(1) Registry", desc: "Swap-and-pop enumerable selector mapping" },
          { icon: Shield, title: "Shared Storage", desc: "Facets execute under Dispatcher state context" },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="bg-surface border border-border rounded-xl p-4 space-y-1.5 hover:border-border-hover interactive"
          >
            <div className="flex items-center gap-2">
              <Icon className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-text">{title}</span>
            </div>
            <p className="text-[12px] text-text-secondary leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Expandable pipeline */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-text-secondary hover:text-text interactive"
      >
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        <span>{expanded ? "Hide" : "View"} execution pipeline</span>
      </button>

      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 animate-fade-in">
          {STEPS.map((s, i) => (
            <div key={s.step} className="relative bg-surface border border-border rounded-xl p-4 space-y-1">
              <span className="text-[10px] font-mono font-semibold text-accent">
                STEP {s.step}
              </span>
              <p className="text-xs font-medium text-text">{s.title}</p>
              <p className="text-[11px] text-text-muted leading-relaxed">{s.desc}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-border-accent z-10" />
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
