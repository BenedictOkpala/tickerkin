"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  const [highlightedRep, setHighlightedRep] = useState<string | null>(null);

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
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", width: "100%" }}>
      {/* 1. FIRST VIEWPORT: HERO & FINANCIAL BENCHMARK QUOTE MODULE */}
      <section className="tk-hero-container">
        {/* Left / Primary Editorial Hero */}
        <div className="tk-enter-1" style={{ display: "flex", flexDirection: "column" }}>
          <div className="tk-kicker">
            Tokenized Equity Intelligence
          </div>
          <h1 className="tk-hero-headline">
            Trace an equity<br />across its tokenized kin.
          </h1>
          <p className="tk-hero-subtext">
            Resolve one equity into its verified tokenized representations across BNB Smart Chain.
          </p>
          <div className="tk-hero-actions">
            <a href="#comparison-matrix" className="tk-btn-primary">
              Explore {underlying.ticker}
            </a>
            <Link href="/developers/api" className="tk-btn-secondary">
              RWA Lens API →
            </Link>
          </div>
        </div>

        {/* Right / Data Area: Benchmark Quote Module */}
        <div className="tk-quote-module tk-enter-2">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <span className="tk-metric-label">Underlying Equity Benchmark</span>
            <span
              style={{
                fontSize: "0.68rem",
                fontWeight: 700,
                color: "#92400e",
                backgroundColor: "#fef3c7",
                border: "1px solid #fde68a",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-xs)",
              }}
            >
              MARKET CLOSED · US Market Session
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                {underlying.name}
              </h2>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                Primary Exchange: <strong style={{ color: "var(--text-primary)" }}>{underlying.exchange}</strong> · Currency: <strong style={{ color: "var(--text-primary)" }}>{underlying.quoteCurrency}</strong>
              </div>
            </div>
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: "var(--accent-primary)",
                backgroundColor: "var(--accent-primary-soft)",
                border: "1px solid var(--accent-primary-border)",
                padding: "0.2rem 0.55rem",
                borderRadius: "var(--radius-xs)",
              }}
            >
              {underlying.ticker}
            </span>
          </div>

          <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Reference Price (Pyth Oracle Snapshot)
            </div>
            <div
              style={{
                fontSize: "2.1rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
                fontVariantNumeric: "tabular-nums",
                letterSpacing: "-0.02em",
                marginTop: "0.15rem",
              }}
            >
              ${underlying.referencePriceUSD?.toFixed(2)} USD
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.74rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem" }}>
            <span>BNB Smart Chain</span>
            <span style={{ fontWeight: 600, color: "var(--accent-primary)" }}>
              {representations.length} Verified Representations
            </span>
          </div>
        </div>
      </section>

      {/* 2. SIGNATURE "KIN" VISUAL LINEAGE MOTIF */}
      <section className="tk-kin-motif-container tk-enter-3">
        {/* Root Equity Anchor */}
        <div className="tk-kin-motif-root">
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-primary)" }} />
          <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
            {underlying.name} ({underlying.ticker})
          </strong>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            ${underlying.referencePriceUSD?.toFixed(2)} USD
          </span>
        </div>

        {/* Thin TickerKin Blue SVG Lineage Tree with Travelling Highlight Dash */}
        <svg className="tk-kin-motif-tree-svg" viewBox="0 0 900 40" preserveAspectRatio="none">
          {/* Origin Root Node */}
          <circle cx="450" cy="0" r="3.5" fill="var(--accent-primary)" />

          {/* Left Branch (Index 0) */}
          <g
            style={{
              transition: "opacity 0.2s ease",
              opacity: highlightedRep !== null && highlightedRep !== representations[0]?.contractAddress ? 0.35 : 1,
            }}
          >
            <path
              d="M 450 0 C 450 20, 150 20, 150 40"
              fill="none"
              stroke={highlightedRep === representations[0]?.contractAddress ? "var(--accent-primary)" : "#cbd5e1"}
              strokeWidth={highlightedRep === representations[0]?.contractAddress ? 2.5 : 1.5}
            />
            <circle
              cx="150"
              cy="40"
              r={highlightedRep === representations[0]?.contractAddress ? 4 : 3}
              fill={highlightedRep === representations[0]?.contractAddress ? "var(--accent-primary)" : "#94a3b8"}
            />
            <path
              d="M 450 0 C 450 20, 150 20, 150 40"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth={highlightedRep === representations[0]?.contractAddress ? 2.75 : 2}
              className="kin-flow-line kin-flow-line-1"
            />
          </g>

          {/* Center Branch (Index 1) */}
          <g
            style={{
              transition: "opacity 0.2s ease",
              opacity: highlightedRep !== null && highlightedRep !== representations[1]?.contractAddress ? 0.35 : 1,
            }}
          >
            <line
              x1="450"
              y1="0"
              x2="450"
              y2="40"
              stroke={highlightedRep === representations[1]?.contractAddress ? "var(--accent-primary)" : "#cbd5e1"}
              strokeWidth={highlightedRep === representations[1]?.contractAddress ? 2.5 : 1.5}
            />
            <circle
              cx="450"
              cy="40"
              r={highlightedRep === representations[1]?.contractAddress ? 4 : 3}
              fill={highlightedRep === representations[1]?.contractAddress ? "var(--accent-primary)" : "#94a3b8"}
            />
            <line
              x1="450"
              y1="0"
              x2="450"
              y2="40"
              stroke="var(--accent-primary)"
              strokeWidth={highlightedRep === representations[1]?.contractAddress ? 2.75 : 2}
              className="kin-flow-line kin-flow-line-2"
            />
          </g>

          {/* Right Branch (Index 2) */}
          <g
            style={{
              transition: "opacity 0.2s ease",
              opacity: highlightedRep !== null && highlightedRep !== representations[2]?.contractAddress ? 0.35 : 1,
            }}
          >
            <path
              d="M 450 0 C 450 20, 750 20, 750 40"
              fill="none"
              stroke={highlightedRep === representations[2]?.contractAddress ? "var(--accent-primary)" : "#cbd5e1"}
              strokeWidth={highlightedRep === representations[2]?.contractAddress ? 2.5 : 1.5}
            />
            <circle
              cx="750"
              cy="40"
              r={highlightedRep === representations[2]?.contractAddress ? 4 : 3}
              fill={highlightedRep === representations[2]?.contractAddress ? "var(--accent-primary)" : "#94a3b8"}
            />
            <path
              d="M 450 0 C 450 20, 750 20, 750 40"
              fill="none"
              stroke="var(--accent-primary)"
              strokeWidth={highlightedRep === representations[2]?.contractAddress ? 2.75 : 2}
              className="kin-flow-line kin-flow-line-3"
            />
          </g>
        </svg>

        {/* 3 Kin Representation Columns */}
        <div className="tk-kin-motif-columns">
          {representations.map((rep) => {
            const isAvailable = rep.normalizationStatus === "AVAILABLE";
            const isHighlighted = highlightedRep === rep.contractAddress;
            const isQuieted = highlightedRep !== null && !isHighlighted;

            return (
              <div
                key={`motif-${rep.contractAddress}`}
                className={`tk-kin-motif-item ${isHighlighted ? "is-highlighted" : isQuieted ? "is-quieted" : ""}`}
                tabIndex={0}
                role="button"
                aria-label={`Highlight ${rep.tokenSymbol} comparison details`}
                onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                onMouseLeave={() => setHighlightedRep(null)}
                onFocus={() => setHighlightedRep(rep.contractAddress)}
                onBlur={() => setHighlightedRep(null)}
                onClick={() => setHighlightedRep((prev) => (prev === rep.contractAddress ? null : rep.contractAddress))}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
                    {rep.tokenSymbol}
                  </span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--accent-primary)", backgroundColor: "var(--accent-primary-soft)", padding: "0.12rem 0.4rem", borderRadius: "var(--radius-xs)" }}>
                    {rep.providerName}
                  </span>
                </div>
                <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)" }}>
                  Mechanism: <strong>{rep.economicMechanism}</strong>
                </div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: isAvailable ? "#16a34a" : "var(--text-muted)", marginTop: "0.15rem" }}>
                  {isAvailable ? "Available · Live BNB Chain factor" : "Live normalization factor unavailable"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. COHESIVE FINANCIAL COMPARISON INSTRUMENT */}
      <section id="comparison-matrix" className="tk-enter-3" style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
          <div className="tk-kicker">
            Cross-Representation Normalization
          </div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <h2 style={{ fontSize: "1.65rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
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

        {/* Unified Market Comparison Table Instrument */}
        <div className="tk-matrix-instrument">
          <div className="tk-matrix-table-wrap">
            <table className="tk-matrix-table">
              <thead>
                <tr>
                  <th className="tk-matrix-th tk-matrix-row-label">Property</th>
                  {representations.map((rep) => {
                    const isColHighlighted = highlightedRep === rep.contractAddress;
                    return (
                      <th
                        key={`header-${rep.contractAddress}`}
                        className={`tk-matrix-th ${isColHighlighted ? "is-highlighted" : ""}`}
                        style={{ minWidth: "240px", cursor: "pointer" }}
                        tabIndex={0}
                        onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                        onMouseLeave={() => setHighlightedRep(null)}
                        onFocus={() => setHighlightedRep(rep.contractAddress)}
                        onBlur={() => setHighlightedRep(null)}
                        onClick={() => setHighlightedRep((prev) => (prev === rep.contractAddress ? null : rep.contractAddress))}
                      >
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                                {rep.tokenSymbol}
                              </span>
                              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--accent-primary)", backgroundColor: "var(--accent-primary-soft)", padding: "0.15rem 0.45rem", borderRadius: "var(--radius-xs)" }}>
                                {rep.providerName}
                              </span>
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                              Issuer: {rep.issuer}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDrawer(rep);
                            }}
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              color: "var(--accent-primary)",
                              backgroundColor: "var(--bg-card)",
                              border: "1px solid var(--border-card)",
                              padding: "0.2rem 0.45rem",
                              borderRadius: "var(--radius-xs)",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Intelligence ↗
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {/* Row 1: Economic Mechanism */}
                <tr className="tk-matrix-row">
                  <td className="tk-matrix-td tk-matrix-row-label">Mechanism</td>
                  {representations.map((rep) => (
                    <td
                      key={`mech-${rep.contractAddress}`}
                      className={`tk-matrix-td ${highlightedRep === rep.contractAddress ? "tk-matrix-col-highlighted" : ""}`}
                      onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                      onMouseLeave={() => setHighlightedRep(null)}
                    >
                      <strong style={{ color: "var(--text-primary)" }}>{rep.economicMechanism}</strong>
                    </td>
                  ))}
                </tr>

                {/* Row 2: Accounting Factor */}
                <tr className="tk-matrix-row">
                  <td className="tk-matrix-td tk-matrix-row-label">Accounting Factor</td>
                  {representations.map((rep) => {
                    const isAvailable = rep.normalizationStatus === "AVAILABLE";
                    const isColHighlighted = highlightedRep === rep.contractAddress;
                    return (
                      <td
                        key={`factor-${rep.contractAddress}`}
                        className={`tk-matrix-td ${isColHighlighted ? "tk-matrix-col-highlighted" : ""}`}
                        onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                        onMouseLeave={() => setHighlightedRep(null)}
                      >
                        {isAvailable ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                            <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--accent-primary)", fontSize: "0.95rem" }}>
                              {rep.accountingFactor?.toFixed(6)}×
                            </span>
                            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#16a34a", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", padding: "0.1rem 0.35rem", borderRadius: "var(--radius-xs)" }}>
                              Live BSC
                            </span>
                          </div>
                        ) : (
                          <span style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                            Not Assumed (Unavailable)
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 3: Share-Equivalent / Token */}
                <tr className="tk-matrix-row">
                  <td className="tk-matrix-td tk-matrix-row-label">Share-Equivalent</td>
                  {representations.map((rep) => {
                    const isAvailable = rep.normalizationStatus === "AVAILABLE";
                    const isColHighlighted = highlightedRep === rep.contractAddress;
                    return (
                      <td
                        key={`share-${rep.contractAddress}`}
                        className={`tk-matrix-td ${isColHighlighted ? "tk-matrix-col-highlighted" : ""}`}
                        onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                        onMouseLeave={() => setHighlightedRep(null)}
                      >
                        {isAvailable ? (
                          <span style={{ fontWeight: 700, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
                            {rep.shareEquivalentPerToken?.toFixed(4)} shares
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 4: Reference Value / Token */}
                <tr className="tk-matrix-row">
                  <td className="tk-matrix-td tk-matrix-row-label">Reference Value</td>
                  {representations.map((rep) => {
                    const isAvailable = rep.normalizationStatus === "AVAILABLE";
                    const isColHighlighted = highlightedRep === rep.contractAddress;
                    return (
                      <td
                        key={`refval-${rep.contractAddress}`}
                        className={`tk-matrix-td ${isColHighlighted ? "tk-matrix-col-highlighted" : ""}`}
                        onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                        onMouseLeave={() => setHighlightedRep(null)}
                      >
                        {isAvailable ? (
                          <span style={{ fontWeight: 800, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
                            ${rep.referenceValuePerTokenUSD?.toFixed(2)} USD
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 5: Secondary DEX Spot (Cached) */}
                <tr className="tk-matrix-row">
                  <td className="tk-matrix-td tk-matrix-row-label">Secondary DEX Spot</td>
                  {representations.map((rep) => {
                    const isColHighlighted = highlightedRep === rep.contractAddress;
                    return (
                      <td
                        key={`dex-${rep.contractAddress}`}
                        className={`tk-matrix-td ${isColHighlighted ? "tk-matrix-col-highlighted" : ""}`}
                        onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                        onMouseLeave={() => setHighlightedRep(null)}
                      >
                        <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums", color: "var(--text-primary)" }}>
                          {typeof rep.dexMarketPriceUSD === "number" && Number.isFinite(rep.dexMarketPriceUSD) && rep.dexMarketPriceUSD > 0
                            ? `$${rep.dexMarketPriceUSD.toFixed(2)} USD`
                            : "—"}
                        </span>
                      </td>
                    );
                  })}
                </tr>

                {/* Row 6: Reference Deviation */}
                <tr className="tk-matrix-row">
                  <td className="tk-matrix-td tk-matrix-row-label">Reference Deviation</td>
                  {representations.map((rep) => {
                    const isAvailable = rep.normalizationStatus === "AVAILABLE";
                    const isColHighlighted = highlightedRep === rep.contractAddress;
                    return (
                      <td
                        key={`dev-${rep.contractAddress}`}
                        className={`tk-matrix-td ${isColHighlighted ? "tk-matrix-col-highlighted" : ""}`}
                        onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                        onMouseLeave={() => setHighlightedRep(null)}
                      >
                        {isAvailable && rep.referenceDeviationPercent !== null ? (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontVariantNumeric: "tabular-nums",
                              fontWeight: 800,
                              color: rep.referenceDeviationPercent < 0 ? "#4b5563" : "#2563eb",
                            }}
                          >
                            {rep.referenceDeviationPercent > 0 ? "+" : ""}
                            {rep.referenceDeviationPercent.toFixed(3)}%
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Row 7: Contract & Liquidity */}
                <tr className="tk-matrix-row">
                  <td className="tk-matrix-td tk-matrix-row-label">Contract & Liquidity</td>
                  {representations.map((rep) => {
                    const isColHighlighted = highlightedRep === rep.contractAddress;
                    return (
                      <td
                        key={`addr-${rep.contractAddress}`}
                        className={`tk-matrix-td ${isColHighlighted ? "tk-matrix-col-highlighted" : ""}`}
                        onMouseEnter={() => setHighlightedRep(rep.contractAddress)}
                        onMouseLeave={() => setHighlightedRep(null)}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                          <a
                            href={`https://bscscan.com/token/${rep.contractAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--accent-primary)",
                              fontSize: "0.78rem",
                              fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            {rep.contractAddress.slice(0, 6)}...{rep.contractAddress.slice(-4)} ↗
                          </a>
                          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            {rep.dexLiquidityTier}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Explicit Unavailable Note Banner if any representation is unavailable */}
          {representations.some((r) => r.normalizationStatus === "UNAVAILABLE") && (
            <div
              style={{
                backgroundColor: "var(--bg-app)",
                borderTop: "1px solid var(--border-subtle)",
                padding: "0.75rem 1.25rem",
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                lineHeight: 1.45,
              }}
            >
              <strong style={{ color: "var(--text-primary)" }}>Normalization Notice:</strong>{" "}
              {representations.find((r) => r.normalizationStatus === "UNAVAILABLE")?.unavailabilityReason}
            </div>
          )}
        </div>
      </section>

      {/* 4. PRIMARY INTERACTIVE CALCULATOR INSTRUMENT */}
      <div className="tk-enter-4">
        <TokenValueCalculator matrix={activeMatrix} />
      </div>

      {/* 5. HOW TO READ GUIDANCE */}
      <div className="tk-enter-4">
        <HowToReadComparison />
      </div>

      {/* 6. DEEP REPRESENTATION DETAIL DRAWER */}
      <RepresentationDetailDrawer
        representation={selectedRepForDrawer}
        underlying={underlyingForDrawer}
        onClose={() => setSelectedRepForDrawer(null)}
      />
    </div>
  );
}

