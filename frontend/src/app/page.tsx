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
  { id: "Studio", label: "Facet Studio", icon: Sparkles },
  { id: "Routes", label: "Registry", icon: Layers },
  { id: "Dispatcher", label: "Dispatcher", icon: Send },
  { id: "Inspector", label: "Inspector", icon: Binary },
  { id: "Auditor", label: "Auditor", icon: ShieldCheck },
  { id: "SDK", label: "SDK", icon: Code2 },
  { id: "Hasher", label: "Hasher", icon: Hash },
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

      <main className="max-w-[1200px] w-full mx-auto px-5 py-6 flex-1 space-y-6">
        <ArchitectureHero />

        {/* Tab bar */}
        <nav className="flex gap-0.5 border-b border-border overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 -mb-px interactive ${
                  active
                    ? "text-accent border-accent"
                    : "text-text-muted hover:text-text-secondary border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="animate-fade-in">
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

      <footer className="border-t border-border py-5">
        <div className="max-w-[1200px] mx-auto px-5 flex items-center justify-between text-[11px] text-text-muted">
          <span>RouteX Protocol · EVM Dynamic Routing</span>
          <span className="font-mono">Solidity ^0.8.24 · Viem · Wagmi v2</span>
        </div>
      </footer>
    </div>
  );
}
