"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { TokenizedRepresentation } from "@/types/token";
import type { UnderlyingEquity } from "@/types/equity";
import {
  formatEconomicMechanism,
  formatDividendHandling,
  getClaimScopedEvidence,
  getMechanismExplanation,
} from "@/lens/presentation";

interface RepresentationDetailDrawerProps {
  readonly representation: TokenizedRepresentation | null;
  readonly underlying: UnderlyingEquity | null;
  readonly onClose: () => void;
}

export function RepresentationDetailDrawer({
  representation,
  underlying,
  onClose,
}: RepresentationDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!representation || !underlying) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(representation.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const explanation = getMechanismExplanation(representation.economicModel.mechanism);
  const claimEvidence = getClaimScopedEvidence(representation, underlying);
  const dividendText = formatDividendHandling(
    "dividendHandling" in representation.economicModel
      ? representation.economicModel.dividendHandling
      : undefined
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.4)",
        backdropFilter: "blur(2px)",
        zIndex: 110,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          height: "100%",
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-card)",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-surface)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Representation Intelligence
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", marginTop: "0.15rem" }}>
              {representation.tokenSymbol}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.35rem 0.6rem",
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

        {/* Content Body */}
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* SECTION 1: WHAT IS THIS? */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              1. Asset Identity
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Token Symbol & Name:</span>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {representation.tokenSymbol} ({representation.tokenName})
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Underlying Equity:</span>
                <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--accent-primary)" }}>
                  {underlying.name} ({underlying.ticker})
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Provider & Issuer:</span>
                <span style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>
                  {representation.providerName} / {representation.issuer}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Chain & Standard:</span>
                <span style={{ fontSize: "0.84rem", fontWeight: 500, color: "var(--text-primary)" }}>
                  {representation.chain} ({representation.tokenStandard}) · {representation.decimals} Decimals
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.35rem", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>BEP-20 Contract:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <code style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                    {representation.contractAddress.slice(0, 8)}...{representation.contractAddress.slice(-6)}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      fontSize: "0.7rem",
                      padding: "0.1rem 0.4rem",
                      borderRadius: "var(--radius-xs)",
                      backgroundColor: copied ? "var(--accent-primary-soft)" : "var(--bg-app)",
                      color: copied ? "var(--accent-primary)" : "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: HOW DOES IT WORK? */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              2. Economic Model Mechanics
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-md)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 700,
                    color: "var(--accent-primary)",
                    backgroundColor: "var(--accent-primary-soft)",
                    border: "1px solid var(--accent-primary-border)",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "var(--radius-xs)",
                    textTransform: "uppercase",
                  }}
                >
                  {formatEconomicMechanism(representation.economicModel.mechanism)}
                </span>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginTop: "0.5rem", marginBottom: 0 }}>
                  {explanation.description}
                </p>
              </div>

              <div style={{ backgroundColor: "var(--bg-app)", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Corporate Action / Dividend Behavior
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 600, marginTop: "0.2rem" }}>
                  {dividendText}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "0.2rem", lineHeight: 1.4 }}>
                  {explanation.behaviorDetail}
                </div>
              </div>

              {/* Dynamic Factor / Live Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.25rem", borderTop: "1px solid var(--border-subtle)" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Current Dynamic Factor:</span>
                {representation.liveEnrichment ? (
                  <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}>
                    Factor: {representation.liveEnrichment.rawMultiplier} (Live)
                  </span>
                ) : (
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                    Live factor not available (Static baseline)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: HOW WAS IT VERIFIED? (Claim-Scoped Provenance) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              3. Claim-Scoped Provenance Audit
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {claimEvidence.map((ev) => (
                <div
                  key={ev.claimType}
                  style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--border-card)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.85rem 1rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {ev.title}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: "var(--text-muted)",
                        backgroundColor: "var(--bg-app)",
                        padding: "0.1rem 0.35rem",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {ev.sourceClass} · {ev.confidence}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.45, margin: 0 }}>
                    {ev.claim}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem", fontSize: "0.74rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Source: {ev.sourceName}</span>
                    {ev.sourceRef && (
                      <a
                        href={ev.sourceRef}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)", fontWeight: 600, textDecoration: "none" }}
                      >
                        {ev.sourceLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: ACTIONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.5rem" }}>
            <div style={{ display: "flex", gap: "0.6rem" }}>
              <a
                href={`https://bscscan.com/token/${representation.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-card)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "0.55rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                }}
              >
                View on BscScan ↗
              </a>

              <Link
                href={`/equity/${underlying.ticker}/evidence`}
                onClick={onClose}
                style={{
                  flex: 1,
                  textAlign: "center",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--accent-primary)",
                  border: "1px solid var(--accent-primary-border)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  padding: "0.55rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  textDecoration: "none",
                }}
              >
                View Evidence Log
              </Link>
            </div>

            <Link
              href={`/equity/${underlying.ticker}/compare`}
              onClick={onClose}
              style={{
                textAlign: "center",
                backgroundColor: "var(--accent-primary)",
                color: "#ffffff",
                fontSize: "0.84rem",
                fontWeight: 600,
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-sm)",
                textDecoration: "none",
              }}
            >
              Compare Kin Representations →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
