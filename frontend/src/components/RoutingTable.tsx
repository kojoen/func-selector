"use client";

import { useState } from "react";
import { type SelectorItem, CONTRACT_ADDRESSES } from "../config/contracts";
import { formatAddress } from "../lib/utils";
import { RegisterModal } from "./RegisterModal";
import { toast } from "sonner";
import { type Hex, type Address } from "viem";
import { Search, RefreshCw, Plus, Copy, Check, ArrowRightLeft, Trash2, Layers } from "lucide-react";

interface RoutingTableProps {
  routes: SelectorItem[];
  isLoading: boolean;
  isOwner: boolean;
  onRefresh: () => void;
  onReplace: (selector: Hex, newImpl: Address) => Promise<any>;
  onRemove: (selector: Hex) => Promise<any>;
  onRegister: (selector: Hex, impl: Address, sig: string) => Promise<any>;
}

export function RoutingTable({
  routes,
  isLoading,
  isOwner,
  onRefresh,
  onReplace,
  onRemove,
  onRegister,
}: RoutingTableProps) {
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
    toast.success(`Copied: ${text.slice(0, 12)}...`);
    setTimeout(() => setCopied(null), 1200);
  };

  const handleRemove = async (selector: Hex, sig: string) => {
    if (!confirm(`Are you sure you want to remove route for "${sig}" (${selector})?`)) return;
    try {
      toast.loading("Removing route from registry...", { id: "rm" });
      await onRemove(selector);
      toast.success("Route removed successfully", { id: "rm" });
      onRefresh();
    } catch (err: any) {
      toast.error(err.shortMessage || err.message || "Failed to remove route", { id: "rm" });
    }
  };

  const getFacetName = (impl: Address) => {
    const clean = impl.toLowerCase();
    if (clean === CONTRACT_ADDRESSES.mockCalc.toLowerCase()) return "MockCalc Facet";
    if (clean === CONTRACT_ADDRESSES.mockToken.toLowerCase()) return "MockToken Facet";
    return "Custom Facet";
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by signature, 4-byte selector, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text bg-card border border-border hover:border-accent/40 px-4 py-2.5 rounded-xl transition disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-accent" : ""}`} />
            <span>{isLoading ? "Syncing..." : "Refresh"}</span>
          </button>

          {isOwner && (
            <button
              onClick={() => {
                setEditItem(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-white bg-accent hover:bg-accent-hover px-4 py-2.5 rounded-xl transition shadow-glow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Route</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-2xl bg-card overflow-x-auto shadow-card">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border text-[11px] font-semibold text-text-secondary uppercase tracking-wider bg-bg/50">
              <th className="px-6 py-3.5">Selector</th>
              <th className="px-6 py-3.5">Function Signature</th>
              <th className="px-6 py-3.5">Facet Implementation</th>
              {isOwner && <th className="px-6 py-3.5 text-right">Admin Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono">
            {isLoading && routes.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 4 : 3} className="px-6 py-12 text-center text-text-muted">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                    <span>Loading routes from on-chain FunctionRegistry...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 4 : 3} className="px-6 py-12 text-center text-text-muted">
                  {routes.length === 0 ? "No active routes registered in contract." : "No results match your search query."}
                </td>
              </tr>
            ) : (
              filtered.map((route) => (
                <tr key={route.selector} className="hover:bg-bg/60 transition">
                  {/* Selector */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => copy(route.selector, route.selector)}
                      className="group flex items-center gap-1.5 font-bold text-accent hover:underline"
                    >
                      <span>{route.selector}</span>
                      {copied === route.selector ? (
                        <Check className="w-3.5 h-3.5 text-ok" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-text-muted" />
                      )}
                    </button>
                  </td>

                  {/* Signature */}
                  <td className="px-6 py-4 text-text font-medium">
                    {route.signature}
                  </td>

                  {/* Implementation */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-sans font-semibold text-text-muted bg-bg border border-border px-2 py-0.5 rounded-md">
                        {getFacetName(route.implementation)}
                      </span>
                      <button
                        onClick={() => copy(route.implementation, `impl-${route.selector}`)}
                        className="group flex items-center gap-1 text-text-secondary hover:text-text"
                      >
                        <span>{formatAddress(route.implementation, 6)}</span>
                        {copied === `impl-${route.selector}` ? (
                          <Check className="w-3.5 h-3.5 text-ok" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-text-muted" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Actions */}
                  {isOwner && (
                    <td className="px-6 py-4 text-right space-x-2 font-sans">
                      <button
                        onClick={() => {
                          setEditItem(route);
                          setModalOpen(true);
                        }}
                        title="Swap implementation target for this selector"
                        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent bg-bg border border-border hover:border-accent/40 px-3 py-1.5 rounded-lg transition"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                        <span>Swap</span>
                      </button>
                      <button
                        onClick={() => handleRemove(route.selector, route.signature)}
                        title="Remove route from registry"
                        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-err bg-bg border border-border hover:border-err/40 px-3 py-1.5 rounded-lg transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="flex items-center justify-between text-xs text-text-muted px-2">
        <span>
          Showing <strong className="text-text">{filtered.length}</strong> of{" "}
          <strong className="text-text">{routes.length}</strong> active routes
        </span>
        <span className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span>Managed by O(1) FunctionRegistry.sol</span>
        </span>
      </div>

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
