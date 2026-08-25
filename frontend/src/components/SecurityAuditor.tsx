"use client";

import { useState } from "react";
import { type SelectorItem } from "../config/contracts";
import { FunctionSelectorSDK, type CollisionResult } from "../lib/sdk";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export function SecurityAuditor({ routes }: { routes: SelectorItem[] }) {
  const [candidateSignatures, setCandidateSignatures] = useState<string>(
    "transfer(address,uint256)\nbalanceOf(address)\ntotalSupply()\nmint(address,uint256)\nadd(uint256,uint256)\nsub(uint256,uint256)\nmul(uint256,uint256)\ndiv(uint256,uint256)\nmod(uint256,uint256)"
  );

  const sigList = candidateSignatures.split("\n").map((s) => s.trim()).filter(Boolean);
  const collisionResult: CollisionResult = FunctionSelectorSDK.detectCollisions(sigList);

  const zeroRoutes = routes.filter(
    (r) => !r.implementation || r.implementation === "0x0000000000000000000000000000000000000000"
  );

  return (
    <div className="space-y-5">
      {/* Audit cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Collision</span>
            <span className={"text-[10px] font-medium px-2 py-0.5 rounded " + (collisionResult.hasCollision ? "text-err bg-err-muted" : "text-ok bg-ok-muted")}>
              {collisionResult.hasCollision ? "Found" : "None"}
            </span>
          </div>
          <p className="text-[11px] text-text-muted">4-byte hash uniqueness across all signatures</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Targets</span>
            <span className={"text-[10px] font-medium px-2 py-0.5 rounded " + (zeroRoutes.length > 0 ? "text-err bg-err-muted" : "text-ok bg-ok-muted")}>
              {zeroRoutes.length > 0 ? zeroRoutes.length + " Invalid" : "All Valid"}
            </span>
          </div>
          <p className="text-[11px] text-text-muted">Verify facets point to non-zero addresses</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Storage</span>
            <span className="text-[10px] font-medium text-accent px-2 py-0.5 rounded bg-accent-soft">Diamond</span>
          </div>
          <p className="text-[11px] text-text-muted">Delegatecall executes in Dispatcher storage</p>
        </div>
      </div>

      {/* Scanner */}
      <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wider">Collision Scanner</span>
          <span className="text-[10px] text-text-muted font-mono">{sigList.length} signatures</span>
        </div>

        <textarea
          rows={5}
          value={candidateSignatures}
          onChange={(e) => setCandidateSignatures(e.target.value)}
          placeholder="One signature per line..."
          className="w-full bg-bg-raised border border-border rounded-lg p-3.5 text-xs font-mono text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 interactive"
        />

        {collisionResult.hasCollision ? (
          <div className="bg-err-muted border border-err/20 rounded-xl p-4 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-err font-medium">
              <AlertTriangle className="w-4 h-4" /> Collision Detected
            </div>
            {collisionResult.collisions.map((col, idx) => (
              <div key={idx} className="bg-bg-raised p-3 rounded-lg border border-err/10 space-y-1">
                <span className="text-text font-medium">{col.selector}</span>
                <ul className="list-disc pl-4 text-text-secondary">
                  {col.signatures.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-ok-muted border border-ok/20 rounded-xl px-4 py-3 flex items-center gap-2 text-xs text-ok font-mono">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            No collisions detected
          </div>
        )}
      </div>
    </div>
  );
}
