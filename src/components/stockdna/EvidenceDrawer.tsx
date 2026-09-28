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
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(4px)",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          height: "100%",
          backgroundColor: "var(--bg-card)",
          borderLeft: "1px solid var(--border-card)",
          padding: "2rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          overflowY: "auto",
        }}
        className="animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Verification Evidence
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              RWA Lens Provenance Audit Trail
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.9rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Source Class & Confidence */}
        <div
          style={{
            padding: "1rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Evidence Class</span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent-cyan)",
                backgroundColor: "var(--accent-cyan-soft)",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--accent-cyan-border)",
              }}
            >
              {evidence.sourceClass}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Confidence Rating</span>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent-green)",
                backgroundColor: "var(--accent-green-soft)",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {evidence.confidence}
            </span>
          </div>
        </div>

        {/* Source Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Primary Source
          </h4>
          <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
            {evidence.sourceName}
          </div>
          {evidence.sourceRef && (
            <a
              href={evidence.sourceRef}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: "0.8rem",
                color: "var(--accent-cyan)",
                wordBreak: "break-all",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span>{evidence.sourceRef}</span>
              <span>↗</span>
            </a>
          )}
        </div>

        {/* Verification Notes */}
        {evidence.notes && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase" }}>
              Audit Verification Notes
            </h4>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {evidence.notes}
            </p>
          </div>
        )}

        {/* Footer info */}
        <div style={{ marginTop: "auto", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          🛡️ RWA Lens strictly audits every smart contract via direct bytecode verification on BNB Smart Chain RPC nodes before admission into the verified registry.
        </div>
      </div>
    </div>
  );
}
