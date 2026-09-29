"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { lookupByTicker } from "@/lens";
import { getClaimScopedEvidence } from "@/lens/presentation";

interface EvidencePageProps {
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default function EvidencePage({ params }: EvidencePageProps) {
  const { ticker } = use(params);
  const result = lookupByTicker(ticker);

  if (!result.success) {
    notFound();
  }

  const { underlying, representations } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Page Header */}
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Provenance & Verification Audit
        </div>
        <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "0.2rem" }}>
          Evidence Audit Log — {underlying.name} ({underlying.ticker})
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "0.25rem", maxWidth: "840px" }}>
          Claim-scoped audit trails separating on-chain contract bytecode verification, first-party issuer documentation, and real-time oracle/index data.
        </p>
      </div>

      {/* 1. Underlying Benchmark Feed Card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.4rem 1.6rem",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              Underlying Market Benchmark
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.15rem" }}>
              {underlying.name} ({underlying.ticker})
            </div>
          </div>

          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--accent-primary)",
              backgroundColor: "var(--accent-primary-soft)",
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-xs)",
              border: "1px solid var(--accent-primary-border)",
            }}
          >
            {underlying.provenance.sourceClass} · {underlying.provenance.confidence} CONFIDENCE
          </span>
        </div>

        <div style={{ fontSize: "0.84rem", color: "var(--text-secondary)" }}>
          Primary Oracle: <strong style={{ color: "var(--text-primary)" }}>{underlying.provenance.sourceName}</strong>
        </div>

        {underlying.provenance.sourceRef && (
          <div>
            <a
              href={underlying.provenance.sourceRef}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.8rem",
                color: "var(--accent-primary)",
                fontWeight: 600,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>Pyth Network Benchmark Oracle</span>
              <span>↗</span>
            </a>
          </div>
        )}

        {underlying.provenance.notes && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5, backgroundColor: "var(--bg-app)", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-sm)", margin: 0 }}>
            {underlying.provenance.notes}
          </p>
        )}
      </div>

      {/* 2. Representation Claim-Scoped Verification */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <h3 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Tokenized Representation Evidence Trails
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {representations.map((rep) => {
            const claims = getClaimScopedEvidence(rep, underlying);

            return (
              <div
                key={rep.contractAddress}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.5rem",
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                {/* Representation Card Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.85rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                      <span style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {rep.tokenSymbol}
                      </span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        {rep.tokenName}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                      Issuer: <strong style={{ color: "var(--text-primary)" }}>{rep.issuer}</strong> ({rep.providerName})
                    </div>
                  </div>

                  <a
                    href={`https://bscscan.com/token/${rep.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "0.76rem",
                      fontWeight: 600,
                      color: "var(--accent-primary)",
                      backgroundColor: "var(--bg-app)",
                      border: "1px solid var(--border-subtle)",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "var(--radius-xs)",
                      textDecoration: "none",
                    }}
                  >
                    BscScan: {rep.contractAddress.slice(0, 8)}...{rep.contractAddress.slice(-6)} ↗
                  </a>
                </div>

                {/* Claim-Scoped Evidence Breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Verified Claims & Provenance Hierarchy
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "0.85rem",
                    }}
                  >
                    {claims.map((claim) => (
                      <div
                        key={claim.claimType}
                        style={{
                          backgroundColor: "var(--bg-app)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-md)",
                          padding: "1rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>
                            {claim.title}
                          </span>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              color: "var(--text-muted)",
                              backgroundColor: "var(--bg-card)",
                              padding: "0.1rem 0.35rem",
                              borderRadius: "var(--radius-xs)",
                              border: "1px solid var(--border-subtle)",
                            }}
                          >
                            {claim.sourceClass} · {claim.confidence}
                          </span>
                        </div>

                        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>
                          {claim.claim}
                        </p>

                        <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "auto", paddingTop: "0.35rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span>{claim.sourceName}</span>
                          {claim.sourceRef && (
                            <a
                              href={claim.sourceRef}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}
                            >
                              {claim.sourceLabel}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
