"use client";

import { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import { lookupByTicker, lookupByTickerAsync } from "@/lens";
import {
  formatEconomicMechanism,
  formatDividendHandling,
  getMechanismExplanation,
} from "@/lens/presentation";
import type { TokenizedRepresentation } from "@/types/token";
import { RepresentationDetailDrawer } from "@/components/stockdna/RepresentationDetailDrawer";

interface ComparePageProps {
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default function ComparePage({ params }: ComparePageProps) {
  const { ticker } = use(params);
  const result = lookupByTicker(ticker);

  const [activeRepresentations, setActiveRepresentations] = useState<readonly TokenizedRepresentation[]>(
    result.success ? result.representations : []
  );
  const [selectedRep, setSelectedRep] = useState<TokenizedRepresentation | null>(null);

  useEffect(() => {
    let isMounted = true;
    lookupByTickerAsync(ticker).then((asyncResult) => {
      if (isMounted && asyncResult.success) {
        setActiveRepresentations(asyncResult.representations);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [ticker]);

  if (!result.success) {
    notFound();
  }

  const { underlying } = result;
  const representations = activeRepresentations;

  // Distinct mechanisms present for this equity
  const uniqueMechanisms = Array.from(new Set(representations.map((r) => r.economicModel.mechanism)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Compare Header */}
      <div>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-primary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Technical Specification Matrix
        </div>
        <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "0.2rem" }}>
          Representation Comparison — {underlying.name} ({underlying.ticker})
        </h2>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "0.25rem", maxWidth: "840px" }}>
          Side-by-side technical comparison of token mechanics, dividend reinvestment, and verification sources across issuers on BNB Smart Chain.
        </p>
      </div>

      {/* Comparison Table */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          overflowX: "auto",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-app)", borderBottom: "1px solid var(--border-card)" }}>
              <th style={{ padding: "1rem 1.25rem", width: "220px", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                Specification / Dimension
              </th>
              {representations.map((rep) => (
                <th key={rep.contractAddress} style={{ padding: "1rem 1.25rem", color: "var(--text-primary)", fontWeight: 800 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "1.2rem" }}>{rep.tokenSymbol}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRep(rep)}
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "var(--accent-primary)",
                        backgroundColor: "var(--accent-primary-soft)",
                        border: "1px solid var(--accent-primary-border)",
                        padding: "0.15rem 0.45rem",
                        borderRadius: "var(--radius-xs)",
                        cursor: "pointer",
                      }}
                    >
                      Inspect Intelligence ↗
                    </button>
                  </div>
                  <div style={{ fontSize: "0.76rem", fontWeight: 500, color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    {rep.providerName}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Issuer</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-primary)", fontWeight: 600 }}>
                  {r.issuer}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Chain & Standard</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-primary)" }}>
                  {r.chain} ({r.tokenStandard}) · {r.decimals} decimals
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Economic Mechanism</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.76rem",
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                      backgroundColor: "var(--accent-primary-soft)",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--accent-primary-border)",
                    }}
                  >
                    {formatEconomicMechanism(r.economicModel.mechanism)}
                  </span>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Mechanism Description</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {r.economicModel.description}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Dividend & Corporate Actions</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-primary)", fontWeight: 500 }}>
                  {formatDividendHandling(
                    "dividendHandling" in r.economicModel ? r.economicModel.dividendHandling : undefined
                  )}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Dynamic Factor Feed</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem" }}>
                  {r.liveEnrichment ? (
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                      Factor: {r.liveEnrichment.rawMultiplier} ({r.liveEnrichment.matchBasis === "DIRECT_ON_CHAIN_BSC_ETH_CALL" ? "BNB Smart Chain Live" : "Binance Live"})
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      Live factor unreachable in current session (showing verified structural baseline)
                    </span>
                  )}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Contract on BSC</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem" }}>
                  <a
                    href={`https://bscscan.com/token/${r.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      color: "var(--accent-primary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      textDecoration: "none",
                      fontWeight: 600,
                    }}
                  >
                    <span>{r.contractAddress.slice(0, 8)}...{r.contractAddress.slice(-6)}</span>
                    <span>↗</span>
                  </a>
                </td>
              ))}
            </tr>

            <tr>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Audit Provenance</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem" }}>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                      backgroundColor: "var(--bg-app)",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {r.provenance.sourceClass} · {r.provenance.confidence} CONFIDENCE
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Educational Section: How to Read These Differences */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem 1.75rem",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
            How to Read These Differences
          </h3>
          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Each tokenization provider employs a distinct economic and smart contract architecture to mirror corporate actions and total return on-chain.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {uniqueMechanisms.map((mechKey) => {
            const exp = getMechanismExplanation(mechKey);
            return (
              <div
                key={mechKey}
                style={{
                  backgroundColor: "var(--bg-app)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-md)",
                  padding: "1rem 1.15rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.45rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {exp.title}
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                    {exp.subtitle}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>
                  {exp.description}
                </p>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.25rem" }}>
                  {exp.behaviorDetail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Representation Detail Drawer */}
      <RepresentationDetailDrawer
        representation={selectedRep}
        underlying={underlying}
        onClose={() => setSelectedRep(null)}
      />
    </div>
  );
}
