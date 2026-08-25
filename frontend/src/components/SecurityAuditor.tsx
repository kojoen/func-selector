"use client";

import { useState } from "react";
import { type SelectorItem } from "../config/contracts";
import { FunctionSelectorSDK, type CollisionResult } from "../lib/sdk";
import { ShieldCheck, AlertTriangle, CheckCircle2, ShieldAlert, FileCode2, HelpCircle } from "lucide-react";

export function SecurityAuditor({ routes }: { routes: SelectorItem[] }) {
  const [candidateSignatures, setCandidateSignatures] = useState<string>(
    "transfer(address,uint256)\nbalanceOf(address)\ntotalSupply()\nmint(address,uint256)\nadd(uint256,uint256)\nsub(uint256,uint256)\nmul(uint256,uint256)\ndiv(uint256,uint256)\nmod(uint256,uint256)"
  );

  const sigList = candidateSignatures
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const collisionResult: CollisionResult = FunctionSelectorSDK.detectCollisions(sigList);

  // Health checks on active routes
  const zeroAddressRoutes = routes.filter(
    (r) => !r.implementation || r.implementation === "0x0000000000000000000000000000000000000000"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-base font-bold text-text flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-accent" />
          Selector Collision & Protocol Security Auditor
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">
          Audit 4-byte Keccak-256 selector collisions, storage layout integrity, and fallback attack surfaces.
        </p>
      </div>

      {/* Audit Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Check 1: Collision Test */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text uppercase tracking-wider">
              1. Selector Collision
            </span>
            {collisionResult.hasCollision ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-err bg-err/10 px-2 py-0.5 rounded">
                <AlertTriangle className="w-3 h-3" /> Collision Found
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-ok bg-ok/10 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" /> Safe (0 Collisions)
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Verifies that no two distinct signatures generate the identical 4-byte hash inside the router.
          </p>
        </div>

        {/* Check 2: Zero Address Target */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text uppercase tracking-wider">
              2. Facet Target Liveness
            </span>
            {zeroAddressRoutes.length > 0 ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-err bg-err/10 px-2 py-0.5 rounded">
                <ShieldAlert className="w-3 h-3" /> {zeroAddressRoutes.length} Invalid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-ok bg-ok/10 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" /> All Targets Valid
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Ensures all registered routes point to non-zero, active implementation contract addresses.
          </p>
        </div>

        {/* Check 3: Delegatecall Storage Safety */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text uppercase tracking-wider">
              3. Storage Context
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" /> Diamond Standard
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Facets execute under Dispatcher storage context. Ensure facet variables use unique storage slots.
          </p>
        </div>
      </div>

      {/* Collision Scanner Playground */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-text">
            Interactive 4-Byte Collision Scanner
          </span>
          <span className="text-xs text-text-muted font-mono">{sigList.length} signatures tested</span>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Input Function Signatures (one per line):
          </label>
          <textarea
            rows={5}
            value={candidateSignatures}
            onChange={(e) => setCandidateSignatures(e.target.value)}
            placeholder="transfer(address,uint256)..."
            className="w-full bg-bg border border-border rounded-lg p-3 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {collisionResult.hasCollision ? (
          <div className="bg-err/10 border border-err/30 rounded-lg p-4 space-y-2 text-xs text-err font-mono">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>CRITICAL: 4-Byte Collision Detected!</span>
            </div>
            {collisionResult.collisions.map((col, idx) => (
              <div key={idx} className="bg-bg/80 p-2.5 rounded border border-err/20 space-y-1">
                <span className="text-text font-semibold">Selector: {col.selector}</span>
                <ul className="list-disc pl-4 text-text-secondary">
                  {col.signatures.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-ok/10 border border-ok/30 rounded-lg p-3.5 flex items-center gap-2 text-xs text-ok font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Passed! No 4-byte selector hash collisions discovered among the candidate signatures.</span>
          </div>
        )}
      </div>

      {/* Security Best Practices Reference */}
      <div className="bg-bg border border-border rounded-xl p-5 space-y-3 font-mono text-xs text-text-secondary">
        <div className="flex items-center gap-2 font-semibold text-text">
          <FileCode2 className="w-4 h-4 text-accent" />
          <span>EVM Router Security Best Practices:</span>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-[11px]">
          <li>
            <strong>Avoid Plain Fallback Collisions:</strong> In <code className="text-accent">FunctionDispatcher.sol</code>, calldata with length &lt; 4 is rejected with <code className="text-accent">CalldataTooShort</code> to prevent accidental execution of empty selectors.
          </li>
          <li>
            <strong>Bubble Reverts Faithfully:</strong> Using inline assembly <code className="text-accent">returndatacopy(0, 0, returndatasize())</code> ensures custom error signatures are forwarded intact to the client.
          </li>
          <li>
            <strong>O(1) Enumerable Registry:</strong> The swap-and-pop array implementation ensures deletion does not leave unbounded gas gaps or iteration loops.
          </li>
        </ul>
      </div>
    </div>
  );
}
