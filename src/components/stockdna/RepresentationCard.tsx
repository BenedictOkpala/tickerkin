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

  const truncatedAddress = `${representation.contractAddress.slice(0, 8)}...${representation.contractAddress.slice(-6)}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "1.1rem",
        backgroundColor: "var(--bg-card)",
        border: `1px solid ${isTargetMatch ? "var(--accent-bnb)" : "var(--border-card)"}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: isTargetMatch ? "0 2px 12px rgba(240, 185, 11, 0.08)" : "none",
        transition: "border-color 0.15s, background-color 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isTargetMatch) {
          e.currentTarget.style.borderColor = "var(--border-hover)";
          e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isTargetMatch) {
          e.currentTarget.style.borderColor = "var(--border-card)";
          e.currentTarget.style.backgroundColor = "var(--bg-card)";
        }
      }}
    >
      {/* Target Match Badge if reverse lookup resolved this exact token */}
      {isTargetMatch && (
        <div
          style={{
            position: "absolute",
            top: "-10px",
            right: "12px",
            fontSize: "0.68rem",
            fontWeight: 600,
            padding: "0.15rem 0.5rem",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--accent-bnb)",
            color: "#000000",
          }}
        >
          Queried Contract Target
        </div>
      )}

      {/* Header: Provider Name, Issuer & Status */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
        <div>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
            }}
          >
            {representation.providerName}
          </div>
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "0.1rem" }}>
            Issuer: {representation.issuer}
          </div>
        </div>

        <span
          style={{
            fontSize: "0.7rem",
            fontWeight: 500,
            padding: "0.15rem 0.45rem",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--status-active-soft)",
            color: "var(--status-active)",
            border: "1px solid var(--status-active-border)",
          }}
        >
          {representation.status.toLowerCase() === "active" ? "Active" : representation.status}
        </span>
      </div>

      {/* Main Token Symbol & Token Name */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "0.5rem",
        }}
      >
        <div>
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {representation.tokenSymbol}
          </span>
          <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>
            {representation.tokenName}
          </span>
        </div>

        <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          {representation.tokenStandard} · {representation.decimals} decimals
        </span>
      </div>

      {/* BEP-20 Contract Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "var(--bg-surface)",
          padding: "0.35rem 0.6rem",
          borderRadius: "var(--radius-xs)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>BEP-20:</span>
          <code style={{ fontSize: "0.76rem", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
            {truncatedAddress}
          </code>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: "0.72rem",
              padding: "0.15rem 0.45rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: copied ? "var(--status-active-soft)" : "var(--bg-card)",
              color: copied ? "var(--status-active)" : "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              transition: "all 0.15s",
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
            }}
            title="View contract on BscScan"
          >
            <span>BscScan</span>
            <span style={{ fontSize: "0.65rem" }}>↗</span>
          </a>
        </div>
      </div>

      {/* Economic Mechanism */}
      <EconomicPill model={representation.economicModel} />

      {/* Card Footer: Provenance & Live Source */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: "0.25rem",
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
              gap: "0.3rem",
              padding: "0.2rem 0.45rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--status-active-soft)",
              border: "1px solid var(--status-active-border)",
              color: "var(--status-active)",
              fontSize: "0.68rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
            title="Inspect Binance Web3 live data provenance"
          >
            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "var(--status-active)" }} />
            <span>Binance Web3 Live</span>
          </button>
        ) : (
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
            Static verified
          </span>
        )}

        <ProvenanceBadge provenance={representation.provenance} onInspect={onInspectEvidence} />
      </div>
    </div>
  );
}
