"use client";

import { useState, useEffect, type FormEvent } from "react";
import { isValidEvmAddress } from "@/hooks/useStockDna";

interface SearchHeaderProps {
  readonly onSearch: (query: string) => void;
  readonly loading: boolean;
  readonly currentQuery: string;
  readonly onOpenLensDrawer?: () => void;
}

const QUICK_SELECTIONS = [
  { label: "NVDA", query: "NVDA", sub: "3 representations" },
  { label: "AAPL", query: "AAPL", sub: "Ondo" },
  { label: "TSLA", query: "TSLA", sub: "Ondo" },
  {
    label: "0xa9ee...16f75",
    query: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
    sub: "Ondo NVDA Contract",
  },
];

export function SearchHeader({
  onSearch,
  loading,
  currentQuery,
  onOpenLensDrawer,
}: SearchHeaderProps) {
  const [inputValue, setInputValue] = useState(currentQuery);

  useEffect(() => {
    setInputValue(currentQuery);
  }, [currentQuery]);

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
    <header
      style={{
        width: "100%",
        borderBottom: "1px solid var(--border-subtle)",
        backgroundColor: "var(--bg-surface)",
        padding: "0.85rem 1.25rem",
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {/* Top Bar: Brand + Tagline + Raw Data Trigger */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {/* Brand Identity */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "26px",
                  height: "26px",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: "var(--accent-primary-soft)",
                  border: "1px solid var(--accent-primary-border)",
                  color: "var(--accent-primary)",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                }}
              >
                TK
              </span>
              <span
                style={{
                  fontSize: "1.15rem",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                }}
              >
                TickerKin
              </span>
            </div>

            <span style={{ color: "var(--border-card)", fontSize: "0.9rem" }}>|</span>

            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
              }}
            >
              Trace an equity across its tokenized representations
            </span>

            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                padding: "0.15rem 0.45rem",
                borderRadius: "var(--radius-xs)",
                backgroundColor: "var(--accent-bnb-soft)",
                color: "var(--accent-bnb)",
                border: "1px solid var(--accent-bnb-border)",
              }}
            >
              BNB Chain
            </span>
          </div>

          {/* Right Controls: Developer API Drawer */}
          {onOpenLensDrawer && (
            <button
              type="button"
              onClick={onOpenLensDrawer}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.65rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                fontSize: "0.78rem",
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
              <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-primary)" }}>{`{ }`}</code>
              <span>RWA Lens API Payload</span>
            </button>
          )}
        </div>

        {/* Search Input Bar & Quick Selectors */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {/* Main Search Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              flex: "1 1 420px",
              display: "flex",
              alignItems: "center",
              backgroundColor: "var(--bg-input)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-md)",
              padding: "0.25rem 0.35rem 0.25rem 0.75rem",
              transition: "border-color 0.15s, background-color 0.15s",
            }}
          >
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginRight: "0.5rem" }}>
              ⌕
            </span>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search ticker (e.g. NVDA, AAPL) or BEP-20 address (0x...)"
              aria-label="Search ticker or BEP-20 contract address"
              style={{
                flex: 1,
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: "var(--text-primary)",
                fontSize: "0.88rem",
                fontFamily: inputValue.startsWith("0x") ? "var(--font-mono)" : "inherit",
              }}
            />

            {inputValue.trim() && (
              <span
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "var(--radius-xs)",
                  marginRight: "0.4rem",
                  backgroundColor: isContract ? "var(--accent-bnb-soft)" : "var(--accent-primary-soft)",
                  color: isContract ? "var(--accent-bnb)" : "var(--accent-primary)",
                  border: `1px solid ${isContract ? "var(--accent-bnb-border)" : "var(--accent-primary-border)"}`,
                }}
              >
                {isContract ? "Contract Reverse Lookup" : "Equity Ticker"}
              </span>
            )}

            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.82rem",
                padding: "0.38rem 0.85rem",
                borderRadius: "var(--radius-sm)",
                transition: "background-color 0.15s, opacity 0.15s",
                opacity: loading || !inputValue.trim() ? 0.6 : 1,
              }}
            >
              {loading ? "Tracing..." : "Trace"}
            </button>
          </form>

          {/* Quick Selection Chips */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.35rem",
            }}
          >
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "0.2rem" }}>
              Quick Trace:
            </span>
            {QUICK_SELECTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleChipClick(item.query)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-secondary)",
                  fontSize: "0.75rem",
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
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontFamily: item.query.startsWith("0x") ? "var(--font-mono)" : "inherit",
                  }}
                >
                  {item.label}
                </span>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>({item.sub})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
