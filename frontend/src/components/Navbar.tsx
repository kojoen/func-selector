"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { formatAddress } from "../lib/utils";
import { useState } from "react";
import { Copy, Check, ShieldCheck, Cpu } from "lucide-react";

export function Navbar({ isOwner }: { isOwner: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <header className="border-b border-border/80 bg-card/60 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-16">
        <div className="flex items-center gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shadow-glow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-text">
                  RouteX
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded-md border border-accent/20">
                  Protocol
                </span>
              </div>
            </div>
          </div>

          {/* Contract address badges */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => copy(CONTRACT_ADDRESSES.dispatcher, "dis")}
              title="Click to copy Dispatcher Contract Address"
              className="group flex items-center gap-1.5 font-mono text-[11px] text-text-secondary hover:text-text bg-bg border border-border hover:border-accent/40 px-3 py-1.5 rounded-lg transition"
            >
              <span className="text-accent font-semibold">Dispatcher:</span>
              <span>{formatAddress(CONTRACT_ADDRESSES.dispatcher, 4)}</span>
              {copied === "dis" ? (
                <Check className="w-3 h-3 text-ok" />
              ) : (
                <Copy className="w-3 h-3 text-text-muted group-hover:text-accent transition" />
              )}
            </button>

            <button
              onClick={() => copy(CONTRACT_ADDRESSES.registry, "reg")}
              title="Click to copy Registry Contract Address"
              className="group flex items-center gap-1.5 font-mono text-[11px] text-text-secondary hover:text-text bg-bg border border-border hover:border-accent/40 px-3 py-1.5 rounded-lg transition"
            >
              <span className="text-text-muted">Registry:</span>
              <span>{formatAddress(CONTRACT_ADDRESSES.registry, 4)}</span>
              {copied === "reg" ? (
                <Check className="w-3 h-3 text-ok" />
              ) : (
                <Copy className="w-3 h-3 text-text-muted group-hover:text-text transition" />
              )}
            </button>

            {isOwner && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-accent bg-accent/10 border border-accent/30 px-2.5 py-1 rounded-md">
                <ShieldCheck className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
        </div>

        {/* Connect Button */}
        <div className="flex items-center gap-3">
          <ConnectButton
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            chainStatus="icon"
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
