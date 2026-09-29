"use client";

import React, { useState } from "react";

export function HowToReadComparison() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-md)",
        padding: "1rem 1.25rem",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              backgroundColor: "var(--accent-primary-soft)",
              color: "var(--accent-primary)",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            i
          </span>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
            How to read this comparison
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          style={{
            background: "none",
            border: "none",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "var(--accent-primary)",
            cursor: "pointer",
            padding: "0.2rem 0.5rem",
          }}
        >
          {isOpen ? "Hide Guidance ▲" : "Show Guidance ▼"}
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            marginTop: "0.85rem",
            paddingTop: "0.85rem",
            borderTop: "1px solid var(--border-subtle)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            fontSize: "0.8rem",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          <div>
            <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.2rem" }}>
              1. Non-Uniform Economic Units
            </strong>
            Different tokenized versions of the same equity use distinct accounting models (Auto-DRIP, Multiplier, Redemption Rate). 1 raw token does not inherently equal 1 share-equivalent unit.
          </div>

          <div>
            <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.2rem" }}>
              2. Verified Normalization Only
            </strong>
            TickerKin normalizes tokens to share-equivalent values only when verified on-chain or first-party feeds exist. Unverified dynamic factors remain truthfully unavailable without assuming 1.0.
          </div>

          <div>
            <strong style={{ color: "var(--text-primary)", display: "block", marginBottom: "0.2rem" }}>
              3. Reference Deviation ≠ Guaranteed Arbitrage
            </strong>
            Reference Deviation measures the percentage difference between secondary DEX market prices and intrinsic share-equivalent value. It reflects liquidity depth and market hours, not guaranteed instantaneous redemption.
          </div>
        </div>
      )}
    </div>
  );
}
