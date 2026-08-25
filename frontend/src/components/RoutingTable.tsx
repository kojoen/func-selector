"use client";

import { useState } from "react";
import { type SelectorItem, CONTRACT_ADDRESSES } from "../config/contracts";
import { formatAddress } from "../lib/utils";
import { RegisterModal } from "./RegisterModal";
import { toast } from "sonner";
import { type Hex, type Address } from "viem";
import { Search, RefreshCw, Plus, Copy, Check, ArrowRightLeft, Trash2 } from "lucide-react";

interface RoutingTableProps {
  routes: SelectorItem[];
  isLoading: boolean;
  isOwner: boolean;
  onRefresh: () => void;
  onReplace: (selector: Hex, newImpl: Address) => Promise<any>;
  onRemove: (selector: Hex) => Promise<any>;
  onRegister: (selector: Hex, impl: Address, sig: string) => Promise<any>;
}

export function RoutingTable({ routes, isLoading, isOwner, onRefresh, onReplace, onRemove, onRegister }: RoutingTableProps) {
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SelectorItem | null>(null);

  const filtered = routes.filter(
    (r) =>
      r.signature.toLowerCase().includes(search.toLowerCase()) ||
      r.selector.toLowerCase().includes(search.toLowerCase()) ||
      r.implementation.toLowerCase().includes(search.toLowerCase())
  );

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleRemove = async (selector: Hex, sig: string) => {
    if (!confirm("Remove route for " + sig + " (" + selector + ")?")) return;
    try {
      toast.loading("Removing...", { id: "rm" });
      await onRemove(selector);
      toast.success("Removed", { id: "rm" });
      onRefresh();
    } catch (err: any) {
      toast.error(err.shortMessage || err.message || "Failed", { id: "rm" });
    }
  };

  const getFacet = (impl: Address) => {
    const c = impl.toLowerCase();
    if (c === CONTRACT_ADDRESSES.mockCalc.toLowerCase()) return "MockCalc";
    if (c === CONTRACT_ADDRESSES.mockToken.toLowerCase()) return "MockToken";
    return "Custom";
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search routes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-9 pr-3 py-2 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary bg-surface border border-border px-3 py-2 rounded-lg interactive disabled:opacity-40"
          >
            <RefreshCw className={"w-3.5 h-3.5" + (isLoading ? " animate-spin text-accent" : "")} />
            Refresh
          </button>
          {isOwner && (
            <button
              onClick={() => { setEditItem(null); setModalOpen(true); }}
              className="flex items-center gap-1.5 text-xs font-medium text-text-inverse bg-accent hover:bg-accent-hover px-3 py-2 rounded-lg interactive shadow-glow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Register
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-2xl bg-surface overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[10px] font-medium text-text-muted uppercase tracking-wider">
              <th className="px-4 py-3">Selector</th>
              <th className="px-4 py-3">Signature</th>
              <th className="px-4 py-3">Implementation</th>
              {isOwner && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono">
            {isLoading && routes.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 4 : 3} className="px-4 py-10 text-center text-text-muted">
                  <RefreshCw className="w-4 h-4 animate-spin text-accent inline mr-2" />Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 4 : 3} className="px-4 py-10 text-center text-text-muted">
                  {routes.length === 0 ? "No routes registered" : "No match"}
                </td>
              </tr>
            ) : (
              filtered.map((route) => (
                <tr key={route.selector} className="hover:bg-surface-hover interactive">
                  <td className="px-4 py-3">
                    <button onClick={() => copy(route.selector, route.selector)} className="group flex items-center gap-1 text-accent font-medium">
                      {route.selector}
                      {copied === route.selector ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-text">{route.signature}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-sans font-medium text-text-muted bg-bg-raised border border-border px-1.5 py-0.5 rounded uppercase">
                        {getFacet(route.implementation)}
                      </span>
                      <span className="text-text-secondary">{formatAddress(route.implementation, 6)}</span>
                    </div>
                  </td>
                  {isOwner && (
                    <td className="px-4 py-3 text-right font-sans space-x-1">
                      <button
                        onClick={() => { setEditItem(route); setModalOpen(true); }}
                        className="inline-flex items-center gap-1 text-text-muted hover:text-accent bg-bg-raised border border-border px-2 py-1 rounded interactive text-[11px]"
                      >
                        <ArrowRightLeft className="w-3 h-3" /> Swap
                      </button>
                      <button
                        onClick={() => handleRemove(route.selector, route.signature)}
                        className="inline-flex items-center gap-1 text-text-muted hover:text-err bg-bg-raised border border-border px-2 py-1 rounded interactive text-[11px]"
                      >
                        <Trash2 className="w-3 h-3" /> Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-text-muted">
        {filtered.length} of {routes.length} routes
      </p>

      <RegisterModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editingItem={editItem}
        onRegister={onRegister}
        onReplace={onReplace}
        onSuccess={onRefresh}
      />
    </div>
  );
}
