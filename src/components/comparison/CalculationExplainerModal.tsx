"use client";

import React, { useEffect, useRef } from "react";
import type { NormalizedRepresentationComparison, UnderlyingEquityReference } from "@/types/comparison";

interface CalculationExplainerModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly representation: NormalizedRepresentationComparison | undefined;
  readonly underlying: UnderlyingEquityReference;
  readonly tokenAmount: number;
}

export function CalculationExplainerModal({
  isOpen,
  onClose,
  representation,
  underlying,
  tokenAmount,
}: CalculationExplainerModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      closeButtonRef.current?.focus();
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !representation) return null;

  const isAvailable = representation.normalizationStatus === "AVAILABLE" && representation.accountingFactor !== null;
  const factor = representation.accountingFactor;
  const refPrice = underlying.referencePriceUSD ?? 0;
  const shareEquivalent = isAvailable && factor !== null ? tokenAmount * factor : null;
  const totalRefValue = isAvailable && shareEquivalent !== null ? shareEquivalent * refPrice : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calculation-explainer-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Calculation Methodology
            </div>
            <h3
              id="calculation-explainer-title"
              style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginTop: "0.15rem",
              }}
            >
              How is {representation.tokenSymbol} calculated?
            </h3>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.1rem" }}>
              {representation.providerName} · {representation.economicMechanism}
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close calculation explanation modal"
            style={{
              padding: "0.25rem 0.55rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--bg-app)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Content based on availability */}
        {isAvailable ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {/* Step 1: Share Equivalent */}
            <div
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
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
                Step 1: Compute Share-Equivalent Exposure
              </div>
              <div style={{ fontSize: "0.88rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                {tokenAmount} {representation.tokenSymbol} × {factor?.toFixed(6)} ({representation.factorLabel}) = {shareEquivalent?.toFixed(4)} shares
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                {representation.providerId === "bstocks" ? (
                  <>The Multiplier is read dynamically from the NVDAB smart contract on <strong>BNB Smart Chain</strong> via on-chain view function.</>
                ) : representation.providerId === "ondo" ? (
                  <>The dynamic Auto-DRIP scale factor accounts for cumulative net dividend reinvestment for {representation.tokenSymbol}.</>
                ) : (
                  <>The dynamic conversion factor accounts for token mechanism accounting.</>
                )}
              </div>
            </div>

            {/* Step 2: Reference Value */}
            <div
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
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
                Step 2: Reference Value Valuation
              </div>
              <div style={{ fontSize: "0.88rem", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--text-primary)" }}>
                {shareEquivalent?.toFixed(4)} shares × ${refPrice.toFixed(2)} USD = ${totalRefValue?.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                Underlying equity benchmark is <strong>{underlying.name} ({underlying.ticker})</strong> referenced via Pyth Oracle Hermes ({underlying.exchange} session schedule).
              </div>
            </div>

            {/* Data Source & Freshness Breakdown */}
            <div
              style={{
                borderTop: "1px solid var(--border-subtle)",
                paddingTop: "0.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
              }}
            >
              <div>
                • <strong>Accounting Factor Source:</strong> {representation.factorSource ?? "BNB Smart Chain"} (Live Dynamic Feed)
              </div>
              <div>
                • <strong>Reference Price Source:</strong> Pyth Oracle Benchmark (${refPrice.toFixed(2)} USD · Market Closed Snapshot)
              </div>
            </div>
          </div>
        ) : (
          /* Intentionally Unavailable Explanation */
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div
              style={{
                backgroundColor: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "var(--radius-md)",
                padding: "1rem 1.15rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.45rem",
              }}
            >
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#b45309" }}>
                Why is normalization unavailable for {representation.tokenSymbol}?
              </div>
              <p style={{ fontSize: "0.8rem", color: "#92400e", lineHeight: 1.5, margin: 0 }}>
                {representation.providerId === "ondo" ? (
                  "TickerKin has verified the token structure and Auto-DRIP mechanism, but cannot currently reach the dynamic Auto-DRIP factor from its verified runtime source. Normalization is intentionally marked unavailable rather than assuming a false 1.0 factor."
                ) : representation.providerId === "xstocks" ? (
                  "TickerKin does not currently have a verified BSC redemption/conversion factor and refuses to assume 1 token equals 1 share. Normalization is preserved as unavailable without borrowing Solana rate feeds."
                ) : (
                  representation.unavailabilityReason ?? "Dynamic factor is unreachable. TickerKin strictly refuses to assume 1.0."
                )}
              </p>
            </div>

            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
              TickerKin enforces strict provenance integrity: when dynamic factors are unreachable or unverified on BNB Smart Chain, results are left blank rather than filled with fabricated assumptions.
            </div>
          </div>
        )}

        {/* Regulatory / Financial Disclaimer Footer */}
        <div
          style={{
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "0.75rem",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            lineHeight: 1.4,
          }}
        >
          <strong>Notice:</strong> Reference value represents normalized exposure against traditional market benchmarks. It is not an active DEX market order price and does not constitute a guaranteed issuer redemption value.
        </div>
      </div>
    </div>
  );
}
