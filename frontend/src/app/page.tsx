"use client";

import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { ArchitectureHero } from "../components/ArchitectureHero";
import { FacetStudio } from "../components/FacetStudio";
import { RoutingTable } from "../components/RoutingTable";
import { DispatcherPanel } from "../components/DispatcherPanel";
import { CalldataInspector } from "../components/CalldataInspector";
import { SecurityAuditor } from "../components/SecurityAuditor";
import { SdkGenerator } from "../components/SdkGenerator";
import { SelectorHasher } from "../components/SelectorHasher";
import { useRegistry } from "../hooks/useRegistry";
import {
  Sparkles,
  Layers,
  Send,
  Binary,
  ShieldCheck,
  Code2,
  Hash,
} from "lucide-react";

const TABS = [
  { id: "Studio", label: "Facet Studio", icon: Sparkles, badge: "Live DApp" },
  { id: "Routes", label: "Routes Registry", icon: Layers },
  { id: "Dispatcher", label: "Dispatcher Gateway", icon: Send },
  { id: "Inspector", label: "Calldata Inspector", icon: Binary, badge: "EVM Trace" },
  { id: "Auditor", label: "Security Auditor", icon: ShieldCheck },
  { id: "SDK", label: "SDK Codegen", icon: Code2 },
  { id: "Hasher", label: "Selector Hasher", icon: Hash },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function Page() {
  const [tab, setTab] = useState<TabId>("Studio");
  const {
    routes,
    isLoading,
    isOwner,
    refetch,
    registerSelector,
    replaceSelector,
    removeSelector,
  } = useRegistry();

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      <Navbar isOwner={isOwner} />

      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1 space-y-8">
        {/* Architecture Hero & Explainer */}
        <ArchitectureHero />

        {/* Navigation Tabs */}
        <div className="border-b border-border">
          <div className="flex gap-2 overflow-x-auto pb-px">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold whitespace-nowrap transition border-b-2 -mb-px ${
                    isActive
                      ? "text-accent border-accent bg-accent/5 rounded-t-lg"
                      : "text-text-secondary hover:text-text border-transparent hover:border-border"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-accent" : "text-text-muted"}`} />
                  <span>{t.label}</span>
                  {"badge" in t && t.badge && (
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-accent text-white"
                          : "bg-tag-bg text-text-muted border border-border"
                      }`}
                    >
                      {t.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="pt-2 animate-in fade-in duration-200">
          {tab === "Studio" && <FacetStudio />}

          {tab === "Routes" && (
            <RoutingTable
              routes={routes}
              isLoading={isLoading}
              isOwner={isOwner}
              onRefresh={refetch}
              onRegister={registerSelector}
              onReplace={replaceSelector}
              onRemove={removeSelector}
            />
          )}

          {tab === "Dispatcher" && <DispatcherPanel />}

          {tab === "Inspector" && <CalldataInspector />}

          {tab === "Auditor" && <SecurityAuditor routes={routes} />}

          {tab === "SDK" && <SdkGenerator routes={routes} />}

          {tab === "Hasher" && <SelectorHasher />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-text-muted bg-card/30">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text">RouteX Protocol</span>
            <span>·</span>
            <span>EVM Dynamic Selector Routing Standard</span>
          </div>
          <div className="font-mono text-[11px] text-text-secondary">
            Solidity ^0.8.24 · Foundry Tested · Viem & Wagmi v2
          </div>
        </div>
      </footer>
    </div>
  );
}
