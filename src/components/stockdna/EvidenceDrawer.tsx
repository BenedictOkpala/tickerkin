"use client";

import { useEffect } from "react";
import type { EvidenceRecord } from "@/types/provenance";

interface EvidenceDrawerProps {
  readonly evidence: EvidenceRecord | null;
  readonly onClose: () => void;
}

export function EvidenceDrawer({ evidence, onClose }: EvidenceDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!evidence) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(2px)",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          height: "100%",
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-card)",
          padding: "1.75rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          overflowY: "auto",
        }}
        className="animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Verification & Provenance
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              RWA Lens Canonical Evidence Record
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.25rem 0.5rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.85rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Source Class & Confidence Rating */}
        <div
          style={{
            padding: "0.85rem",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Source classification</span>
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
              {evidence.sourceClass}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Confidence rating</span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 600,
                color: "var(--status-active)",
                backgroundColor: "var(--status-active-soft)",
                padding: "0.15rem 0.45rem",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--status-active-border)",
              }}
            >
              {evidence.confidence}
            </span>
          </div>
        </div>

        {/* Primary Source */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
            Primary verification source
          </div>
          <div style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
            {evidence.sourceName}
          </div>
          {evidence.sourceRef && (
            <a
              href={evidence.sourceRef}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.78rem",
                color: "var(--accent-primary)",
                wordBreak: "break-all",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                marginTop: "0.2rem",
              }}
            >
              <span>{evidence.sourceRef}</span>
              <span>↗</span>
            </a>
          )}
        </div>

        {/* Verification Notes */}
        {evidence.notes && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>
              Audit notes
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
              {evidence.notes}
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div
          style={{
            marginTop: "auto",
            padding: "0.75rem",
            backgroundColor: "var(--bg-input)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.72rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
          }}
        >
          RWA Lens audits institutional smart contracts on BNB Smart Chain via direct on-chain bytecode validation, Pyth Oracle Hermes feeds, and first-party issuer repositories prior to registry admission.
        </div>
      </div>
    </div>
  );
}
