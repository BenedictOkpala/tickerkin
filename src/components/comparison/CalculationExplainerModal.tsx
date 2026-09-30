"use client";

import React, { useEffect } from "react";

interface CalculationExplainerModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function CalculationExplainerModal({ isOpen, onClose }: CalculationExplainerModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="explainer-modal-title"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-card)",
          width: "100%",
          maxWidth: "640px",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "1.75rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--accent-primary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Normalization Methodology
            </div>
            <h3
              id="explainer-modal-title"
              style={{
                fontSize: "1.3rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
                marginTop: "0.15rem",
              }}
            >
              How is Normalized Value Calculated?
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: "none",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-xs)",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Tokenized equities use different economic mechanisms (multiplier, dividend reinvestment, redemption rates) rather than maintaining static 1:1 parity with underlying stock shares. TickerKin normalizes all tokens into comparable share-equivalent units.
        </p>

        {/* Step-by-Step Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {/* Step 1 */}
          <div
            style={{
              backgroundColor: "var(--bg-app)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
                Step 1 · Input Tokens
              </span>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-muted)" }}>
                Q_token
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Raw Token Quantity Entered
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              The number of BEP-20 token units held in wallet or entered in the calculator.
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              backgroundColor: "var(--bg-app)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
                Step 2 · Protocol Factor
              </span>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent-primary)" }}>
                F_accounting
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Live Accounting / Multiplier Factor
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Retrieved directly from on-chain smart contracts or verified issuer feeds (e.g. BTech or Backed contract <code>multiplier()</code> on BNB Smart Chain). If unverified, the factor is not assumed.
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              backgroundColor: "var(--bg-app)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
                Step 3 · Share-Equivalent Exposure
              </span>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>
                Shares = Q_token × F_accounting
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Normalized Share Quantity
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Represents the token amount expressed in comparable underlying share-equivalent units.
            </div>
          </div>

          {/* Step 4 */}
          <div
            style={{
              backgroundColor: "var(--bg-app)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.85rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase" }}>
                Step 4 · Total Reference Value
              </span>
              <span style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-primary)" }}>
                Value_USD = Shares × P_underlying
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600 }}>
              Normalized Reference Value
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
              Calculated using the verified Pyth Oracle snapshot for the underlying traditional equity.
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#ffffff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "0.5rem 1.25rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
