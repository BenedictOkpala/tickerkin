"use client";

import { useState } from "react";
import type { TokenizedRepresentation } from "@/types/token";
import type { EvidenceRecord } from "@/types/provenance";
import { EconomicPill } from "./EconomicPill";
import { ProvenanceBadge } from "./ProvenanceBadge";

interface RepresentationCardProps {
  readonly representation: TokenizedRepresentation;
  readonly onInspectEvidence: (evidence: EvidenceRecord) => void;
  readonly isTargetMatch?: boolean;
}

export function RepresentationCard({
  representation,
  onInspectEvidence,
  isTargetMatch,
}: RepresentationCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(representation.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const truncatedAddress = `${representation.contractAddress.slice(0, 6)}...${representation.contractAddress.slice(-4)}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        padding: "1.25rem",
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${isTargetMatch ? "var(--accent-cyan)" : "var(--border-card)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: isTargetMatch ? "0 0 20px rgba(0, 240, 255, 0.15)" : "0 4px 15px rgba(0, 0, 0, 0.2)",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isTargetMatch) e.currentTarget.style.borderColor = "var(--border-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isTargetMatch) e.currentTarget.style.borderColor = "var(--border-card)";
      }}
    >
      {/* Header: Provider & Status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--accent-gold)",
            }}
          >
            {representation.providerName}
          </span>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
            Issuer: {representation.issuer}
          </div>
        </div>

        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "0.15rem 0.45rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--accent-green-soft)",
            color: "var(--accent-green)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          {representation.status}
        </span>
      </div>

      {/* Main Token Info */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "0.6rem",
        }}
      >
        <div>
          <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {representation.tokenSymbol}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>
            {representation.tokenName}
          </span>
        </div>

        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {representation.tokenStandard} • {representation.decimals}d
        </span>
      </div>

      {/* Contract Address Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "var(--bg-surface)",
          padding: "0.4rem 0.6rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>BSC:</span>
          <code style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {truncatedAddress}
          </code>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: "0.75rem",
              padding: "0.15rem 0.4rem",
              borderRadius: "3px",
              backgroundColor: copied ? "var(--accent-green-soft)" : "var(--bg-card)",
              color: copied ? "var(--accent-green)" : "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              transition: "all 0.15s",
            }}
            title="Copy full contract address"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>

          <a
            href={`https://bscscan.com/token/${representation.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.75rem",
              padding: "0.15rem 0.4rem",
              borderRadius: "3px",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
            }}
            title="View on BscScan"
          >
            ↗
          </a>
        </div>
      </div>

      {/* Economic Mechanism */}
      <EconomicPill model={representation.economicModel} />

      {/* Footer: Provenance & Dex Info */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: "0.4rem",
        }}
      >
        <ProvenanceBadge provenance={representation.provenance} onInspect={onInspectEvidence} />

        {representation.marketInfo?.primaryDEX && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            DEX: {representation.marketInfo.primaryDEX}
          </span>
        )}
      </div>
    </div>
  );
}
