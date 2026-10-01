"use client";

import React, { useState, useEffect } from "react";
import type { EquityComparisonMatrix, NormalizedRepresentationComparison } from "@/types/comparison";
import type { TokenizedRepresentation } from "@/types/token";
import { lookupByContract } from "@/lens";
import { HowToReadComparison } from "./HowToReadComparison";
import { TokenValueCalculator } from "./TokenValueCalculator";
import { RepresentationDetailDrawer } from "@/components/stockdna/RepresentationDetailDrawer";

interface InteractiveComparisonProps {
  readonly matrix: EquityComparisonMatrix;
}

export function InteractiveComparison({ matrix: initialMatrix }: InteractiveComparisonProps) {
  const [activeMatrix, setActiveMatrix] = useState<EquityComparisonMatrix>(initialMatrix);
  const [selectedRepForDrawer, setSelectedRepForDrawer] = useState<TokenizedRepresentation | null>(null);

  // Client-side dynamic enrichment to ensure live BSC RPC state is always freshest
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveComparison() {
      try {
        const res = await fetch(`/api/lens/ticker/${initialMatrix.underlying.ticker}/comparison`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const liveMatrix = json?.data || json?.matrix || (json?.representations ? json : null);
          if (liveMatrix && isMounted) {
            setActiveMatrix(liveMatrix);
          }
        }
      } catch (err) {
        console.warn("Client comparison live fetch fallback:", err);
      }
    }
    fetchLiveComparison();
    return () => {
      isMounted = false;
    };
  }, [initialMatrix.underlying.ticker]);

  const { underlying, representations } = activeMatrix;

  const handleOpenDrawer = (compRep: NormalizedRepresentationComparison) => {
    const lookup = lookupByContract(compRep.contractAddress);
    if (lookup.success) {
      setSelectedRepForDrawer(lookup.matchedRepresentation);
    }
  };

  const underlyingForDrawer = {
    ticker: underlying.ticker,
    name: underlying.name,
    exchange: underlying.exchange,
    quoteCurrency: underlying.quoteCurrency,
    marketHours: {
      isOpen: underlying.marketStatus === "LIVE",
      schedule: underlying.marketSchedule,
      timezone: "America/New_York",
    },
    provenance: underlying.provenance,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem", width: "100%" }}>
      {/* 1. Comparison Section Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--accent-primary)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Cross-Representation Normalization
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2
            style={{
              fontSize: "1.65rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Compare Tokenized {underlying.ticker}
          </h2>
          <span style={{ fontSize: "0.84rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            {underlying.name} · {underlying.exchange} · BNB Smart Chain
          </span>
        </div>
        <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", maxWidth: "800px", lineHeight: 1.45 }}>
          Trace how NVIDIA is represented across distinct tokenization protocols on BNB Smart Chain and normalize their disparate economic mechanisms.
        </p>
      </div>

      {/* 2. Underlying Benchmark Reference Card */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem 1.5rem",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--accent-primary-soft)",
              border: "1px solid var(--accent-primary-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              color: "var(--accent-primary)",
              fontSize: "1rem",
            }}
          >
            {underlying.ticker}
          </div>
          <div>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Underlying Equity Benchmark
            </div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {underlying.name} ({underlying.ticker})
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>
              Primary Exchange: <strong>{underlying.exchange}</strong> · Currency: <strong>{underlying.quoteCurrency}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Reference Price (Pyth Oracle Snapshot)
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.01em",
              }}
            >
              ${underlying.referencePriceUSD?.toFixed(2)} USD
            </div>
          </div>

          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: "#92400e",
              backgroundColor: "#fef3c7",
              border: "1px solid #fde68a",
              padding: "0.35rem 0.65rem",
              borderRadius: "var(--radius-xs)",
              textAlign: "center",
            }}
          >
            <div>MARKET CLOSED</div>
            <div style={{ fontSize: "0.68rem", fontWeight: 500, opacity: 0.85, marginTop: "0.1rem" }}>
              US Market Session
            </div>
          </div>
        </div>
      </div>

      {/* 3. Three Representation Comparison Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {representations.map((rep) => {
          const isAvailable = rep.normalizationStatus === "AVAILABLE";

          return (
            <div
              key={rep.contractAddress}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-lg)",
                padding: "1.4rem",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                    <span
                      style={{
                        fontSize: "1.3rem",
                        fontWeight: 800,
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {rep.tokenSymbol}
                    </span>
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
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Issuer: {rep.issuer}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenDrawer(rep)}
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--accent-primary)",
                    backgroundColor: "var(--bg-app)",
                    border: "1px solid var(--border-subtle)",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "var(--radius-xs)",
                    cursor: "pointer",
                  }}
                >
                  Intelligence ↗
                </button>
              </div>

              {/* Economic Mechanism Badge */}
              <div
                style={{
                  backgroundColor: "var(--bg-app)",
                  padding: "0.55rem 0.75rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: "0.78rem",
                }}
              >
                <span style={{ color: "var(--text-muted)" }}>Mechanism: </span>
                <strong style={{ color: "var(--text-primary)" }}>{rep.economicMechanism}</strong>
              </div>

              {/* Data Metrics Grid */}
              {isAvailable ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      paddingBottom: "0.4rem",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>{rep.factorLabel}</span>
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--accent-primary)" }}>
                      {rep.accountingFactor?.toFixed(6)}×
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      paddingBottom: "0.4rem",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>Share-Equivalent / Token</span>
                    <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
                      {rep.shareEquivalentPerToken?.toFixed(4)} shares
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      paddingBottom: "0.4rem",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>Reference Value / Token</span>
                    <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
                      ${rep.referenceValuePerTokenUSD?.toFixed(2)} USD
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      paddingBottom: "0.4rem",
                      borderBottom: "1px solid var(--border-subtle)",
                    }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>Secondary DEX Spot (Cached)</span>
                    <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
                      {typeof rep.dexMarketPriceUSD === "number" && Number.isFinite(rep.dexMarketPriceUSD) && rep.dexMarketPriceUSD > 0
                        ? `$${rep.dexMarketPriceUSD.toFixed(2)} USD`
                        : "—"}
                    </span>
                  </div>

                  {/* Reference Deviation Pill */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                      padding: "0.45rem 0.65rem",
                      backgroundColor: "var(--bg-app)",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--border-subtle)",
                      marginTop: "0.2rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.74rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        Reference Deviation
                      </div>
                      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        DEX spot vs reference value
                      </div>
                    </div>

                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 800,
                        fontSize: "0.88rem",
                        color:
                          rep.referenceDeviationPercent !== null && rep.referenceDeviationPercent < 0
                            ? "#4b5563"
                            : "#2563eb",
                      }}
                    >
                      {rep.referenceDeviationPercent !== null
                        ? `${rep.referenceDeviationPercent > 0 ? "+" : ""}${rep.referenceDeviationPercent.toFixed(3)}%`
                        : "—"}
                    </span>
                  </div>
                </div>
              ) : (
                /* UNAVAILABLE Normalization Card State */
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div
                    style={{
                      backgroundColor: "var(--bg-app)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.85rem 1rem",
                      fontSize: "0.78rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.45,
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "0.25rem", color: "var(--text-primary)" }}>
                      Normalization Status: UNAVAILABLE
                    </div>
                    {rep.unavailabilityReason}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", opacity: 0.65, fontSize: "0.8rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Conversion Factor:</span>
                      <span style={{ fontStyle: "italic" }}>Not Assumed</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Share-Equivalent:</span>
                      <span>—</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Reference Value:</span>
                      <span>—</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-muted)" }}>Secondary DEX Spot:</span>
                      <span>
                        {typeof rep.dexMarketPriceUSD === "number" && Number.isFinite(rep.dexMarketPriceUSD) && rep.dexMarketPriceUSD > 0
                          ? `$${rep.dexMarketPriceUSD.toFixed(2)} USD (Cached)`
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Card Footer: BscScan Link & Liquidity Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.74rem",
                  color: "var(--text-muted)",
                  paddingTop: "0.6rem",
                  borderTop: "1px solid var(--border-subtle)",
                  marginTop: "auto",
                }}
              >
                <a
                  href={`https://bscscan.com/token/${rep.contractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "var(--accent-primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  {rep.contractAddress.slice(0, 6)}...{rep.contractAddress.slice(-4)} ↗
                </a>

                <span>
                  Liquidity: <strong style={{ color: "var(--text-primary)" }}>{rep.dexLiquidityTier}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Token Value Calculator Component */}
      <TokenValueCalculator matrix={activeMatrix} />

      {/* 5. How To Read Guidance */}
      <HowToReadComparison />

      {/* 6. Deep Representation Detail Drawer */}
      <RepresentationDetailDrawer
        representation={selectedRepForDrawer}
        underlying={underlyingForDrawer}
        onClose={() => setSelectedRepForDrawer(null)}
      />
    </div>
  );
}
