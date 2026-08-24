"use client";

import { useState, useEffect } from "react";
import { type SelectorItem } from "../config/contracts";
import { computeSelector } from "../lib/utils";
import { toast } from "sonner";
import { type Hex, type Address, isAddress } from "viem";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem: SelectorItem | null;
  onRegister: (selector: Hex, impl: Address, sig: string) => Promise<any>;
  onReplace: (selector: Hex, newImpl: Address) => Promise<any>;
  onSuccess: () => void;
}

export function RegisterModal({
  isOpen,
  onClose,
  editingItem,
  onRegister,
  onReplace,
  onSuccess,
}: RegisterModalProps) {
  const [signature, setSignature] = useState("");
  const [implementation, setImplementation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setSignature(editingItem.signature);
      setImplementation(editingItem.implementation);
    } else {
      setSignature("");
      setImplementation("");
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const isEdit = !!editingItem;
  const selector = signature.trim() ? computeSelector(signature) : "0x--------";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddress(implementation)) {
      toast.error("Invalid address");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await onReplace(selector as Hex, implementation as Address);
        toast.success("Route updated");
      } else {
        await onRegister(selector as Hex, implementation as Address, signature.trim());
        toast.success("Route registered");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.shortMessage || err.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-text">
            {isEdit ? "Swap Implementation" : "Register Route"}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Function Signature
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              placeholder="transfer(address,uint256)"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/60 disabled:opacity-50 disabled:bg-bg"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Computed Selector
            </label>
            <div className="bg-bg border border-border rounded px-3 py-2 font-mono text-sm text-accent">
              {selector}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Implementation Address
            </label>
            <input
              type="text"
              required
              placeholder="0x..."
              value={implementation}
              onChange={(e) => setImplementation(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 text-sm font-mono placeholder:text-text-muted focus:outline-none focus:border-accent/60"
            />
          </div>

          <p className="text-xs text-text-muted">
            The target contract will be called via DELEGATECALL in the Dispatcher&apos;s storage context.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-text-secondary hover:text-text px-4 py-2 rounded border border-border transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !signature || !implementation}
              className="text-sm font-medium text-white bg-accent hover:bg-accent-hover px-4 py-2 rounded transition disabled:opacity-40"
            >
              {submitting ? "Sending..." : isEdit ? "Update" : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
