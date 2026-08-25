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
      toast.error("Please enter a valid Ethereum address (0x...)");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await onReplace(selector as Hex, implementation as Address);
        toast.success("Route updated successfully");
      } else {
        await onRegister(selector as Hex, implementation as Address, signature.trim());
        toast.success("Route registered successfully");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-text">
            {isEdit ? "Swap Implementation" : "Register New Route"}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text text-xl p-1 transition">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Function Signature
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              placeholder="e.g. transfer(address,uint256)"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent disabled:opacity-50 disabled:bg-bg/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Computed 4-Byte Selector
            </label>
            <div className="bg-bg border border-border rounded-lg px-3.5 py-2.5 font-mono text-xs text-accent font-semibold">
              {selector}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1.5">
              Implementation Contract Address
            </label>
            <input
              type="text"
              required
              placeholder="0xImplementationAddress..."
              value={implementation}
              onChange={(e) => setImplementation(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
          </div>

          <p className="text-[11px] text-text-muted leading-relaxed">
            The target contract will be called via <code className="text-accent font-mono">DELEGATECALL</code> in the Dispatcher&apos;s storage context.
          </p>

          <div className="flex justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-text-secondary hover:text-text px-4 py-2.5 rounded-xl border border-border transition hover:bg-bg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !signature || !implementation}
              className="text-xs font-semibold text-white bg-accent hover:bg-accent-hover px-5 py-2.5 rounded-xl transition disabled:opacity-40 shadow-glow-sm"
            >
              {submitting ? "Confirming..." : isEdit ? "Update Route" : "Register Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
