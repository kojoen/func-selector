"use client";

import { useState } from "react";
import { type SelectorItem } from "../config/contracts";
import { formatAddress } from "../lib/utils";
import { RegisterModal } from "./RegisterModal";
import { toast } from "sonner";
import { type Hex, type Address } from "viem";

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
    setTimeout(() => setCopied(null), 1200);
  };

  const handleRemove = async (selector: Hex, sig: string) => {
    if (!confirm(`Remove route "${sig}" (${selector})?`)) return;
    try {
      toast.loading("Removing...", { id: "rm" });
      await onRemove(selector);
      toast.success("Removed", { id: "rm" });
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || "Failed", { id: "rm" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search by signature, selector, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 border border-border rounded px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-accent/60"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-sm text-text-secondary hover:text-text px-3 py-2 border border-border rounded transition disabled:opacity-40"
          >
            {isLoading ? "Syncing..." : "Refresh"}
          </button>
          {isOwner && (
            <button
              onClick={() => {
                setEditItem(null);
                setModalOpen(true);
              }}
              className="text-sm font-medium text-white bg-accent hover:bg-accent-hover px-4 py-2 rounded transition"
            >
              + Register
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded bg-card overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-text-secondary">
              <th className="px-4 py-3 font-medium">Selector</th>
              <th className="px-4 py-3 font-medium">Signature</th>
              <th className="px-4 py-3 font-medium">Implementation</th>
              {isOwner && <th className="px-4 py-3 font-medium text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading && routes.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 4 : 3} className="px-4 py-12 text-center text-text-muted text-sm">
                  Loading routes...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isOwner ? 4 : 3} className="px-4 py-12 text-center text-text-muted text-sm">
                  {routes.length === 0 ? "No routes registered yet." : "No results for this search."}
                </td>
              </tr>
            ) : (
              filtered.map((route) => (
                <tr key={route.selector} className="hover:bg-bg transition">
                  {/* Selector */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copy(route.selector, route.selector)}
                      className="font-mono text-xs text-accent hover:underline"
                    >
                      {copied === route.selector ? "copied!" : route.selector}
                    </button>
                  </td>

                  {/* Signature */}
                  <td className="px-4 py-3 font-mono text-xs text-text">
                    {route.signature}
                  </td>

                  {/* Implementation */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => copy(route.implementation, `impl-${route.selector}`)}
                      className="font-mono text-xs text-text-secondary hover:text-text"
                    >
                      {copied === `impl-${route.selector}`
                        ? "copied!"
                        : formatAddress(route.implementation, 6)}
                    </button>
                  </td>

                  {/* Actions */}
                  {isOwner && (
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditItem(route);
                          setModalOpen(true);
                        }}
                        className="text-xs text-text-secondary hover:text-accent transition"
                      >
                        Swap
                      </button>
                      <button
                        onClick={() => handleRemove(route.selector, route.signature)}
                        className="text-xs text-text-secondary hover:text-err transition"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count footer */}
      <p className="text-xs text-text-muted">
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
