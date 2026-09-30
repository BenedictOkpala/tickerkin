"use client";

import React, { useState, useMemo } from "react";
import type { EquityComparisonMatrix } from "@/types/comparison";
import type { ProviderId } from "@/types/token";
import { calculateTokenValue } from "@/lens/comparison";
import { CalculationExplainerModal } from "./CalculationExplainerModal";

interface TokenValueCalculatorProps {
  readonly matrix: EquityComparisonMatrix;
}

export function TokenValueCalculator({ matrix }: TokenValueCalculatorProps) {
  // Track explicit user selection to avoid overriding manual user choice
  const [userSelectedProvider, setUserSelectedProvider] = useState<ProviderId | null>(null);
  const [amountStr, setAmountStr] = useState<string>("100");
  const [isExplainerOpen, setIsExplainerOpen] = useState<boolean>(false);

  // Derive active provider: respect explicit user choice if valid; otherwise default to first AVAILABLE representation
  const selectedProvider = useMemo<ProviderId>(() => {
    if (userSelectedProvider) {
      const exists = matrix.representations.some((r) => r.providerId === userSelectedProvider);
      if (exists) return userSelectedProvider;
    }
    const firstAvailable = matrix.representations.find((r) => r.normalizationStatus === "AVAILABLE")?.providerId;
    if (firstAvailable) return firstAvailable;
    return matrix.representations[0]?.providerId || "bstocks";
  }, [userSelectedProvider, matrix.representations]);

  const numAmount = useMemo(() => {
    if (amountStr.trim() === "") return Number.NaN;
    return Number.parseFloat(amountStr);
  }, [amountStr]);

  const calculation = useMemo(() => {
    return calculateTokenValue(
      {
        ticker: matrix.underlying.ticker,
        providerId: selectedProvider,
        tokenAmount: numAmount,
      },
      matrix
    );
  }, [matrix, selectedProvider, numAmount]);

  const selectedRep = matrix.representations.find((r) => r.providerId === selectedProvider);

  // Dynamic isolated footnote according to selected provider
  const providerFootnote = useMemo(() => {
    if (selectedProvider === "bstocks") {
      return "BTech (bStocks) tokenized equities represent 1:1 shares adjusted by an on-chain multiplier on BNB Smart Chain.";
    }
    if (selectedProvider === "ondo") {
      return "Ondo Global Markets tokens implement an Auto-DRIP mechanism reflecting dividend reinvestment via scaled UI balances.";
    }
    if (selectedProvider === "xstocks") {
      return "Identity & legal structure verified under Swiss DLT / Backed Assets (JE) Limited prospectus. Dynamic rate tracking will be activated when an on-chain BSC Pyth redemption feed is connected.";
    }
    return "Token mechanism and legal structure verified in RWA Lens registry.";
  }, [selectedProvider]);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1.75rem",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent-primary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Interactive Mechanism Calculator
            </span>
            <button
              type="button"
              onClick={() => setIsExplainerOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "var(--accent-primary)",
                fontSize: "0.74rem",
                fontWeight: 600,
                textDecoration: "underline",
                cursor: "pointer",
                padding: 0,
              }}
            >
              How is this calculated?
            </button>
          </div>
          <h3
            style={{
              fontSize: "1.35rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginTop: "0.15rem",
            }}
          >
            What is my token worth?
          </h3>
          <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "0.2rem", maxWidth: "680px" }}>
            Enter a token quantity to calculate its normalized share-equivalent exposure and reference value using verified accounting mechanisms.
          </p>
        </div>

        <div
          style={{
            fontSize: "0.74rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            backgroundColor: "var(--bg-app)",
            padding: "0.3rem 0.6rem",
            borderRadius: "var(--radius-xs)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          Underlying: <strong style={{ color: "var(--text-primary)" }}>${matrix.underlying.referencePriceUSD?.toFixed(2)} USD</strong> (Pyth Oracle Snapshot · Market Closed)
        </div>
      </div>

      {/* Controls: Amount Input + Representation Selection */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.25rem",
          backgroundColor: "var(--bg-app)",
          padding: "1.25rem",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {/* 1. Token Amount Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label
            htmlFor="calculator-token-amount"
            style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}
          >
            Token Amount
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              id="calculator-token-amount"
              type="number"
              min="0"
              step="any"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="e.g. 100"
              style={{
                flex: 1,
                padding: "0.55rem 0.75rem",
                fontSize: "1rem",
                fontWeight: 600,
                fontFamily: "var(--font-mono)",
                color: "var(--text-primary)",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-sm)",
                outline: "none",
              }}
            />
          </div>

          {/* Quick Presets */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.2rem" }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Presets:</span>
            {[10, 50, 100, 500].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmountStr(preset.toString())}
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-xs)",
                  padding: "0.15rem 0.4rem",
                  cursor: "pointer",
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          {!calculation.isValid && calculation.validationError && (
            <div style={{ fontSize: "0.74rem", color: "#dc2626", fontWeight: 600, marginTop: "0.2rem" }}>
              {calculation.validationError}
            </div>
          )}
        </div>

        {/* 2. Representation Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Tokenized Representation
          </label>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {matrix.representations.map((rep) => {
              const isSelected = rep.providerId === selectedProvider;
              const isAvailable = rep.normalizationStatus === "AVAILABLE";

              return (
                <button
                  key={rep.contractAddress}
                  type="button"
                  onClick={() => setUserSelectedProvider(rep.providerId)}
                  style={{
                    flex: "1 1 80px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "0.5rem 0.65rem",
                    borderRadius: "var(--radius-sm)",
                    border: isSelected
                      ? "1.5px solid var(--accent-primary)"
                      : "1px solid var(--border-card)",
                    backgroundColor: isSelected ? "var(--accent-primary-soft)" : "var(--bg-card)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.92rem",
                      fontWeight: 800,
                      color: isSelected ? "var(--accent-primary)" : "var(--text-primary)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {rep.tokenSymbol}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
                    {rep.providerName}
                  </span>
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      color: isAvailable ? "#16a34a" : "var(--text-muted)",
                      marginTop: "0.15rem",
                    }}
                  >
                    {isAvailable ? "Live factor · BNB Chain" : "Factor unavailable"}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedRep && (
            <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
              Mechanism: <strong style={{ color: "var(--text-primary)" }}>{selectedRep.economicMechanism}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Output Results Section */}
      {calculation.isValid && (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {calculation.normalizationStatus === "AVAILABLE" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Top Banner: Primary Calculated Reference Value */}
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Total Normalized Reference Value
                  </div>
                  <div
                    style={{
                      fontSize: "1.85rem",
                      fontWeight: 800,
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-mono)",
                      letterSpacing: "-0.02em",
                      marginTop: "0.1rem",
                    }}
                  >
                    ${calculation.totalReferenceValueUSD?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "0.76rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Share-Equivalent Exposure
                  </div>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "var(--accent-primary)",
                      fontFamily: "var(--font-mono)",
                      marginTop: "0.1rem",
                    }}
                  >
                    {calculation.shareEquivalentAmount?.toFixed(4)} shares
                  </div>
                </div>
              </div>

              {/* Step-by-Step Breakdown Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "0.85rem",
                }}
              >
                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Raw Tokens Entered</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: "0.15rem" }}>
                    {calculation.rawTokenAmount} {calculation.tokenSymbol}
                  </div>
                </div>

                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Verified {calculation.factorLabel}</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent-primary)", fontFamily: "var(--font-mono)", marginTop: "0.15rem" }}>
                    {calculation.accountingFactor?.toFixed(6)}×
                  </div>
                </div>

                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Underlying Stock Price</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: "0.15rem" }}>
                    ${calculation.underlyingReferencePriceUSD?.toFixed(2)} USD
                  </div>
                </div>

                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Mechanism Value Accretion</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "#16a34a", fontFamily: "var(--font-mono)", marginTop: "0.15rem" }}>
                    +${calculation.mechanismAccretionUSD?.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Provenance Footnote */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.74rem",
                  color: "var(--text-muted)",
                  paddingTop: "0.5rem",
                }}
              >
                <span>
                  Factor source: <strong style={{ color: "var(--text-secondary)" }}>{calculation.source}</strong>
                </span>
                <span>
                  Status: <span style={{ color: "#16a34a", fontWeight: 700 }}>● VERIFIED LIVE FACTOR</span>
                </span>
              </div>
            </div>
          ) : (
            /* UNAVAILABLE Normalization State (e.g. NVDAx on BSC) */
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div
                style={{
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "var(--radius-sm)",
                  padding: "1rem 1.15rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "#b45309" }}>
                    ⚠️ Normalization Unavailable on BSC
                  </span>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: "#b45309",
                      backgroundColor: "#fef3c7",
                      padding: "0.1rem 0.35rem",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid #fde68a",
                    }}
                  >
                    DATA GAP PRESERVED
                  </span>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#92400e", lineHeight: 1.45 }}>
                  {calculation.unavailabilityReason}
                </div>
              </div>

              {/* Explicit Blank / Null Indicators */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "0.85rem",
                  opacity: 0.75,
                }}
              >
                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Raw Tokens Entered</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)", marginTop: "0.15rem" }}>
                    {calculation.rawTokenAmount} {calculation.tokenSymbol}
                  </div>
                </div>

                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Accounting Factor</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.15rem" }}>
                    Unavailable (Not Assumed)
                  </div>
                </div>

                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Share-Equivalent</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.15rem" }}>
                    —
                  </div>
                </div>

                <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Total Reference Value</div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-muted)", fontStyle: "italic", marginTop: "0.15rem" }}>
                    —
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                {providerFootnote}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explainer Modal */}
      <CalculationExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />
    </div>
  );
}
