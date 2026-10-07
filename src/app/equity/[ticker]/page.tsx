"use client";

import { useState, use } from "react";
import Link from "next/link";
import { lookupByTicker } from "@/lens/baseline";
import { formatEconomicMechanism } from "@/lens/presentation";
import type { TokenizedRepresentation } from "@/types/token";
import { RepresentationDetailDrawer } from "@/components/stockdna/RepresentationDetailDrawer";

interface EquityOverviewPageProps {
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default function EquityOverviewPage({ params }: EquityOverviewPageProps) {
  const { ticker } = use(params);
  const result = lookupByTicker(ticker);

  const [selectedRep, setSelectedRep] = useState<TokenizedRepresentation | null>(null);

  if (!result.success) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
        Equity &apos;{ticker}&apos; not found in verified registry.
      </div>
    );
  }

  const { underlying, representations } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Quick Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Representations
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {representations.length}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Across {new Set(representations.map((r) => r.providerId)).size} distinct token providers
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Primary Blockchain
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            BNB Chain
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            BEP-20 standard · chainId 56
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Underlying Quote
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {underlying.quoteCurrency}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Benchmark currency ({underlying.exchange})
          </div>
        </div>
      </div>

      {/* 2. Representations Lineage Summary */}
      <div
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Verified Tokenized Representations
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
              Verified representation breakdown across issuers on BNB Smart Chain. Click any card for detailed intelligence.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {representations.length > 1 && (
              <Link
                href={`/equity/${underlying.ticker}/compare`}
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-app)",
                  border: "1px solid var(--border-subtle)",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                }}
              >
                Compare Specs
              </Link>
            )}

            <Link
              href={`/equity/${underlying.ticker}/kin`}
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#ffffff",
                backgroundColor: "var(--accent-primary)",
                padding: "0.4rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
            >
              Open Kin Map →
            </Link>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {representations.map((rep) => (
            <div
              key={rep.contractAddress}
              onClick={() => setSelectedRep(rep)}
              style={{
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.boxShadow = "var(--shadow-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {rep.tokenSymbol}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>
                    {rep.tokenName}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--accent-primary)",
                    backgroundColor: "var(--accent-primary-soft)",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--accent-primary-border)",
                  }}
                >
                  {rep.providerName}
                </span>
              </div>

              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                Issuer: <strong style={{ color: "var(--text-secondary)" }}>{rep.issuer}</strong>
              </div>

              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-card)",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Mechanism:</span>
                <strong style={{ color: "var(--text-primary)" }}>
                  {formatEconomicMechanism(rep.economicModel.mechanism)}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-muted)", paddingTop: "0.25rem", borderTop: "1px solid var(--border-subtle)" }}>
                <span>Contract:</span>
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                  {rep.contractAddress.slice(0, 8)}...{rep.contractAddress.slice(-6)}
                </code>
                <span style={{ color: "var(--accent-primary)", fontWeight: 600, fontSize: "0.74rem" }}>
                  Inspect Details →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Representation Intelligence Drawer */}
      <RepresentationDetailDrawer
        representation={selectedRep}
        underlying={underlying}
        onClose={() => setSelectedRep(null)}
      />
    </div>
  );
}
