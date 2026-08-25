"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { formatAddress } from "../lib/utils";
import { useState } from "react";
import { Copy, Check, ShieldCheck } from "lucide-react";

export function Navbar({ isOwner }: { isOwner: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 h-14">
        {/* Left: Brand */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/12 border border-accent/25 flex items-center justify-center">
              <span className="text-accent text-sm font-bold">R</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-text">RouteX</span>
            <span className="hidden sm:inline text-[10px] font-medium text-accent/80 bg-accent-soft border border-accent/15 px-1.5 py-px rounded">
              Sepolia
            </span>
          </div>

          {/* Contract chips */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => copy(CONTRACT_ADDRESSES.dispatcher, "dis")}
              className="group flex items-center gap-1.5 font-mono text-[11px] text-text-muted hover:text-text-secondary bg-surface border border-border hover:border-border-hover px-2 py-1 rounded-md interactive"
            >
              <span className="text-accent/70">Router</span>
              <span>{formatAddress(CONTRACT_ADDRESSES.dispatcher, 4)}</span>
              {copied === "dis" ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 interactive" />}
            </button>

            <button
              onClick={() => copy(CONTRACT_ADDRESSES.registry, "reg")}
              className="group flex items-center gap-1.5 font-mono text-[11px] text-text-muted hover:text-text-secondary bg-surface border border-border hover:border-border-hover px-2 py-1 rounded-md interactive"
            >
              <span className="text-text-muted">Registry</span>
              <span>{formatAddress(CONTRACT_ADDRESSES.registry, 4)}</span>
              {copied === "reg" ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 interactive" />}
            </button>

            {isOwner && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-accent bg-accent-soft border border-accent/20 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                Owner
              </span>
            )}
          </div>
        </div>

        {/* Right: Connect */}
        <ConnectButton
          accountStatus={{ smallScreen: "avatar", largeScreen: "full" }}
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </header>
  );
}
