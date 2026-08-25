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

export function RegisterModal({ isOpen, onClose, editingItem, onRegister, onReplace, onSuccess }: RegisterModalProps) {
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
    if (!isAddress(implementation)) { toast.error("Invalid address"); return; }
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
      toast.error(err.shortMessage || err.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-2xl p-6 space-y-5 shadow-float animate-fade-in">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text">
            {isEdit ? "Swap Implementation" : "Register Route"}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text text-lg interactive">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] text-text-muted mb-1.5">Function Signature</label>
            <input
              type="text"
              required
              disabled={isEdit}
              placeholder="transfer(address,uint256)"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive disabled:opacity-40"
            />
          </div>

          <div>
            <label className="block text-[11px] text-text-muted mb-1.5">Computed Selector</label>
            <div className="bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 font-mono text-xs text-accent font-medium">
              {selector}
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-text-muted mb-1.5">Implementation Address</label>
            <input
              type="text"
              required
              placeholder="0x..."
              value={implementation}
              onChange={(e) => setImplementation(e.target.value)}
              className="w-full bg-bg-raised border border-border rounded-lg px-3.5 py-2.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="text-xs text-text-muted hover:text-text px-4 py-2 rounded-lg border border-border interactive">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !signature || !implementation}
              className="text-xs font-medium text-text-inverse bg-accent hover:bg-accent-hover px-4 py-2 rounded-lg interactive disabled:opacity-30 shadow-glow-sm"
            >
              {submitting ? "Confirming..." : isEdit ? "Update" : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
