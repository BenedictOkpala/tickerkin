"use client";

import { useState, type FormEvent } from "react";
import { isValidEvmAddress } from "@/hooks/useStockDna";

interface SearchHeaderProps {
  readonly onSearch: (query: string) => void;
  readonly loading: boolean;
  readonly currentQuery: string;
}

const QUICK_EXAMPLES = [
  { label: "NVDA", query: "NVDA", badge: "Flagship 3x" },
  { label: "AAPL", query: "AAPL", badge: "Ondo" },
  { label: "TSLA", query: "TSLA", badge: "Ondo" },
  {
    label: "Ondo NVDA Contract",
    query: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
    badge: "BSC 0xa9ee...",
  },
];

export function SearchHeader({ onSearch, loading, currentQuery }: SearchHeaderProps) {
  const [inputValue, setInputValue] = useState(currentQuery);

  const isContract = isValidEvmAddress(inputValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const handleChipClick = (query: string) => {
    setInputValue(query);
    onSearch(query);
  };

  return (
    <header style={{ width: "100%", maxWidth: "960px", margin: "0 auto", padding: "1.5rem 1rem 1rem" }}>
      {/* Brand & Subtitle */}
      <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "0.25rem 0.6rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--accent-gold-soft)",
              color: "var(--accent-gold)",
              border: "1px solid var(--accent-gold-border)",
            }}
          >
            BNB Chain RWA
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>•</span>
          <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Powered by RWA Lens</span>
        </div>

        <h1
          style={{
            fontSize: "2.25rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            marginBottom: "0.5rem",
          }}
        >
          Stock<span style={{ color: "var(--accent-gold)" }}>DNA</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "620px", margin: "0 auto" }}>
          Discover and verify tokenized stock representations on BNB Smart Chain.
          Compare issuer mechanics, accounting models, and on-chain provenance.
        </p>
      </div>

      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "0.4rem 0.6rem 0.4rem 1rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        <span style={{ color: "var(--text-muted)", marginRight: "0.75rem", display: "flex", alignItems: "center" }}>
          🔍
        </span>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search traditional ticker (e.g. NVDA, AAPL) or BSC contract (0x...)"
          aria-label="Search ticker or contract address"
          style={{
            flex: 1,
            backgroundColor: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            fontFamily: inputValue.startsWith("0x") ? "var(--font-mono)" : "inherit",
          }}
        />

        {inputValue && (
          <span
            style={{
              fontSize: "0.75rem",
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-sm)",
              marginRight: "0.5rem",
              backgroundColor: isContract ? "var(--accent-cyan-soft)" : "var(--accent-gold-soft)",
              color: isContract ? "var(--accent-cyan)" : "var(--accent-gold)",
              border: `1px solid ${isContract ? "var(--accent-cyan-border)" : "var(--accent-gold-border)"}`,
            }}
          >
            {isContract ? "Contract Mode" : "Ticker Mode"}
          </span>
        )}

        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          style={{
            backgroundColor: "var(--accent-gold)",
            color: "#000",
            fontWeight: 600,
            fontSize: "0.9rem",
            padding: "0.55rem 1.25rem",
            borderRadius: "var(--radius-md)",
            transition: "opacity 0.2s",
            opacity: loading || !inputValue.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "Resolving..." : "Inspect"}
        </button>
      </form>

      {/* Quick Select Chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          marginTop: "0.85rem",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginRight: "0.25rem" }}>
          Verified Examples:
        </span>
        {QUICK_EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => handleChipClick(ex.query)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.25rem 0.65rem",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-secondary)",
              fontSize: "0.8rem",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--border-hover)";
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{ex.label}</span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--accent-gold)",
                backgroundColor: "var(--accent-gold-soft)",
                padding: "0.1rem 0.35rem",
                borderRadius: "3px",
              }}
            >
              {ex.badge}
            </span>
          </button>
        ))}
      </div>
    </header>
  );
}
