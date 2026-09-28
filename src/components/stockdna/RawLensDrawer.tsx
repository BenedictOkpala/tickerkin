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
          maxWidth: "620px",
          height: "100%",
          backgroundColor: "var(--bg-surface)",
          borderLeft: "1px solid var(--border-card)",
          padding: "1.5rem 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
        }}
        className="animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              RWA Lens API Response
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Normalized payload consumed by TickerKin
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

        {/* Endpoint & Copy Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-card)",
            padding: "0.4rem 0.65rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <code style={{ fontSize: "0.78rem", fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>
            GET {endpointUrl}
          </code>

          <button
            type="button"
            onClick={handleCopy}
            style={{
              fontSize: "0.74rem",
              fontWeight: 600,
              padding: "0.2rem 0.55rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: copied ? "var(--status-active-soft)" : "var(--bg-surface)",
              color: copied ? "var(--status-active)" : "var(--text-primary)",
              border: "1px solid var(--border-subtle)",
              transition: "all 0.15s",
            }}
          >
            {copied ? "Copied" : "Copy JSON"}
          </button>
        </div>

        {/* JSON Code Area */}
        <pre
          style={{
            flex: 1,
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "0.85rem",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.78rem",
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
