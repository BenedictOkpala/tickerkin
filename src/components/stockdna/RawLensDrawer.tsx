"use client";

import { useState, useEffect } from "react";

interface RawLensDrawerProps {
  readonly rawJson: Record<string, unknown> | null;
  readonly query: string;
  readonly lookupType: "ticker" | "contract";
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function RawLensDrawer({
  rawJson,
  query,
  lookupType,
  isOpen,
  onClose,
}: RawLensDrawerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !rawJson) return null;

  const endpointUrl = lookupType === "contract"
    ? `/api/lens/contract/${encodeURIComponent(query)}`
    : `/api/lens/ticker/${encodeURIComponent(query)}`;

  const jsonString = JSON.stringify(rawJson, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
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
          maxWidth: "600px",
          height: "100%",
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-card)",
          padding: "1.75rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
        className="animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)" }}>
              Raw RWA Lens JSON
            </h3>
            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Canonical normalized output from HTTP API
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.3rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-subtle)",
              fontSize: "0.9rem",
            }}
          >
            ✕
          </button>
        </div>

        {/* Endpoint & Copy Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-card)",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <code style={{ fontSize: "0.8rem", fontFamily: "var(--font-mono)", color: "var(--accent-gold)" }}>
            GET {endpointUrl}
          </code>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.25rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: copied ? "var(--accent-green-soft)" : "var(--accent-gold)",
              color: copied ? "var(--accent-green)" : "#000",
              transition: "all 0.15s",
            }}
          >
            {copied ? "✓ Copied JSON" : "Copy JSON"}
          </button>
        </div>

        {/* JSON Code Inspector */}
        <pre
          style={{
            flex: 1,
            backgroundColor: "var(--bg-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1rem",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            lineHeight: 1.5,
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          {jsonString}
        </pre>
      </div>
    </div>
  );
}
