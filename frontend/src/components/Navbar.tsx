"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { formatAddress } from "../lib/utils";
import { useState } from "react";

export function Navbar({ isOwner }: { isOwner: boolean }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1200);
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-14">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <span className="text-sm font-semibold tracking-tight text-text">
            RouteX
          </span>

          {/* Contract addresses - small pills */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => copy(CONTRACT_ADDRESSES.registry, "reg")}
              className="font-mono text-[11px] text-text-secondary hover:text-text bg-tag-bg px-2 py-0.5 rounded transition"
            >
              registry:{" "}
              {copied === "reg" ? "copied!" : formatAddress(CONTRACT_ADDRESSES.registry, 4)}
            </button>
            <button
              onClick={() => copy(CONTRACT_ADDRESSES.dispatcher, "dis")}
              className="font-mono text-[11px] text-text-secondary hover:text-text bg-tag-bg px-2 py-0.5 rounded transition"
            >
              dispatcher:{" "}
              {copied === "dis" ? "copied!" : formatAddress(CONTRACT_ADDRESSES.dispatcher, 4)}
            </button>
            {isOwner && (
              <span className="text-[11px] font-medium text-accent bg-accent/10 px-2 py-0.5 rounded">
                owner
              </span>
            )}
          </div>
        </div>

        <ConnectButton
          accountStatus="avatar"
          chainStatus="icon"
          showBalance={false}
        />
      </div>
    </header>
  );
}
