"use client";

import { useState } from "react";
import type { TokenizedRepresentation } from "@/types/token";
import type { EvidenceRecord } from "@/types/provenance";
import { EconomicPill } from "./EconomicPill";
import { ProvenanceBadge } from "./ProvenanceBadge";

interface RepresentationCardProps {
  readonly representation: TokenizedRepresentation;
  readonly onInspectEvidence: (evidence: EvidenceRecord) => void;
  readonly onInspectRepresentation?: (representation: TokenizedRepresentation) => void;
  readonly isTargetMatch?: boolean;
}

export function RepresentationCard({
  representation,
  onInspectEvidence,
  onInspectRepresentation,
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

  const truncatedAddress = `${representation.contractAddress.slice(0, 8)}...${representation.contractAddress.slice(-6)}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.95rem",
        padding: "1.35rem 1.4rem",
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${isTargetMatch ? "var(--accent-bnb)" : "var(--border-card)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: isTargetMatch
          ? "0 2px 14px rgba(180, 133, 0, 0.12)"
          : "var(--shadow-card)",
        transition: "border-color 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isTargetMatch) {
          e.currentTarget.style.borderColor = "var(--border-hover)";
          e.currentTarget.style.boxShadow = "var(--shadow-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isTargetMatch) {
          e.currentTarget.style.borderColor = "var(--border-card)";
          e.currentTarget.style.boxShadow = "var(--shadow-card)";
        }
      }}
    >
      {/* Target Match Badge if reverse lookup resolved this exact token */}
      {isTargetMatch && (
        <div
          style={{
            position: "absolute",
            top: "-10px",
            right: "14px",
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "0.15rem 0.55rem",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--accent-bnb)",
            color: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          Queried Contract Target
        </div>
      )}

      {/* 1. Hierarchy: Provider & Issuer Context Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
          <div
            style={{
              fontSize: "0.86rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            {representation.providerName}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Issuer: {representation.issuer}
          </div>
        </div>

        {onInspectRepresentation && (
          <button
            type="button"
            onClick={() => onInspectRepresentation(representation)}
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
            title="Inspect full representation intelligence"
          >
            Inspect ↗
          </button>
        )}
      </div>

      {/* 2. Hierarchy: Token Symbol & Representation Name */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "0.65rem",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "1.45rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            {representation.tokenSymbol}
          </span>
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-secondary)",
              marginLeft: "0.5rem",
              fontWeight: 500,
            }}
          >
            {representation.tokenName}
          </span>
        </div>

        <span
          style={{
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            backgroundColor: "var(--bg-app)",
            padding: "0.15rem 0.45rem",
            borderRadius: "var(--radius-xs)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {representation.tokenStandard} · {representation.decimals}d
        </span>
      </div>

      {/* 3. Hierarchy: Economic Mechanism (Primary Differentiator) */}
      <EconomicPill model={representation.economicModel} />

      {/* 4. Hierarchy: BEP-20 Contract Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "var(--bg-app)",
          padding: "0.45rem 0.65rem",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 500 }}>Contract:</span>
          <code
            style={{
              fontSize: "0.78rem",
              fontFamily: "var(--font-mono)",
              color: "var(--text-primary)",
            }}
          >
            {truncatedAddress}
          </code>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: "0.72rem",
              padding: "0.15rem 0.45rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: copied ? "var(--accent-primary-soft)" : "var(--bg-card)",
              color: copied ? "var(--accent-primary)" : "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              transition: "all 0.15s",
              fontWeight: 500,
            }}
            title="Copy contract address"
          >
            {copied ? "Copied" : "Copy"}
          </button>

          <a
            href={`https://bscscan.com/token/${representation.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.72rem",
              padding: "0.15rem 0.45rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.15rem",
              fontWeight: 500,
            }}
            title="View contract on BscScan"
          >
            <span>BscScan</span>
            <span style={{ fontSize: "0.65rem" }}>↗</span>
          </a>
        </div>
      </div>

      {/* 5. Hierarchy: Provenance & Live Source Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: "0.35rem",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        {representation.liveEnrichment ? (
          <button
            type="button"
            onClick={() => onInspectEvidence(representation.liveEnrichment!.provenance)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--accent-primary-soft)",
              border: "1px solid var(--accent-primary-border)",
              color: "var(--accent-primary)",
              fontSize: "0.72rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="Inspect Binance Web3 live data provenance"
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "var(--accent-primary)",
              }}
            />
            <span>Binance Web3 Live</span>
          </button>
        ) : (
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
            Static verified
          </span>
        )}

        <ProvenanceBadge provenance={representation.provenance} onInspect={onInspectEvidence} />
      </div>
    </div>
  );
}
