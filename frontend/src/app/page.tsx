"use client";

import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { RoutingTable } from "../components/RoutingTable";
import { DispatcherPanel } from "../components/DispatcherPanel";
import { SelectorHasher } from "../components/SelectorHasher";
import { useRegistry } from "../hooks/useRegistry";

const TABS = ["Routes", "Dispatcher", "Hasher"] as const;
type Tab = (typeof TABS)[number];

export default function Page() {
  const [tab, setTab] = useState<Tab>("Routes");
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
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar isOwner={isOwner} />

      {/* Page header */}
      <div className="max-w-6xl w-full mx-auto px-6 pt-10 pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          RouteX
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Dynamic calldata routing and selector registry for EVM contracts.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl w-full mx-auto px-6">
        <div className="flex gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium transition ${
                tab === t
                  ? "text-accent border-b-2 border-accent -mb-px"
                  : "text-text-secondary hover:text-text"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl w-full mx-auto px-6 py-8 flex-1">
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
        {tab === "Hasher" && <SelectorHasher />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-text-muted">
        RouteX · Solidity ^0.8.24
      </footer>
    </div>
  );
}
