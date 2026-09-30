"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isValidEvmAddress } from "@/hooks/useStockDna";

interface TopBarProps {
  readonly onToggleMobileSidebar?: () => void;
  readonly currentQuery?: string;
}

const QUICK_CHIPS = [
  { label: "NVDA", query: "NVDA", sub: "3 reps" },
  { label: "AAPL", query: "AAPL", sub: "Ondo" },
  { label: "TSLA", query: "TSLA", sub: "Ondo" },
  {
    label: "0xa9ee...16f75",
    query: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
    sub: "NVDAon Contract",
  },
];

export function TopBar({ onToggleMobileSidebar, currentQuery = "" }: TopBarProps) {
  const router = useRouter();
  const [inputVal, setInputVal] = useState(currentQuery);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    const clean = query.trim();
    if (!clean) return;

    setSearching(true);
    const isContract = isValidEvmAddress(clean);

    try {
      if (isContract) {
        // Resolve contract to underlying ticker
        const res = await fetch(`/api/lens/contract/${encodeURIComponent(clean)}`);
        const json = await res.json();

        if (json.ok && json.data?.underlying?.ticker) {
          const ticker = json.data.underlying.ticker;
          router.push(`/equity/${ticker}/kin?match=${encodeURIComponent(clean)}`);
        } else {
          // If contract not found, default to NVDA with notice
          router.push(`/equity/NVDA/kin?error=contract_not_found&query=${encodeURIComponent(clean)}`);
        }
      } else {
        router.push(`/equity/${clean.toUpperCase()}`);
      }
    } catch {
      router.push(`/equity/${clean.toUpperCase()}`);
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch(inputVal);
  };

  const onChipClick = (query: string) => {
    setInputVal(query);
    handleSearch(query);
  };

  return (
    <header
      className="topbar-header"
      style={{
        height: "64px",
        backgroundColor: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        gap: "1rem",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Mobile Toggle + Search Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flex: 1, maxWidth: "780px" }}>
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Menu"
          className="mobile-menu-btn"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            width: "38px",
            height: "38px",
            minWidth: "38px",
            minHeight: "38px",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)",
            fontSize: "1.15rem",
          }}
        >
          ☰
        </button>

        {/* Global Search Form */}
        <form
          onSubmit={onSubmit}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "0.3rem 0.55rem",
            transition: "border-color 0.15s",
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginRight: "0.4rem" }}>
            ⌕
          </span>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Search ticker (e.g. NVDA) or contract (0x...)"
            aria-label="Search ticker or BSC contract"
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.86rem",
              fontFamily: inputVal.startsWith("0x") ? "var(--font-mono)" : "inherit",
              minWidth: 0,
            }}
          />

          <button
            type="submit"
            disabled={searching || !inputVal.trim()}
            className="topbar-search-btn"
            aria-label="Submit search"
            style={{
              backgroundColor: "var(--accent-primary)",
              color: "#ffffff",
              fontWeight: 600,
              fontSize: "0.78rem",
              padding: "0.25rem 0.7rem",
              borderRadius: "var(--radius-xs)",
              opacity: searching || !inputVal.trim() ? 0.6 : 1,
              transition: "opacity 0.15s",
              cursor: "pointer",
            }}
          >
            <span className="topbar-search-btn-text">{searching ? "..." : "Search"}</span>
            <span className="topbar-search-btn-icon" style={{ display: "none" }}>{searching ? "..." : "↵"}</span>
          </button>
        </form>

        {/* Quick Chips on desktop */}
        <div className="topbar-quick-chips" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          {QUICK_CHIPS.slice(0, 3).map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={() => onChipClick(chip.query)}
              style={{
                fontSize: "0.74rem",
                padding: "0.2rem 0.5rem",
                borderRadius: "var(--radius-xs)",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Chain Context */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
        <div
          className="topbar-chain-container"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "0.25rem 0.65rem",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--accent-bnb-soft)",
            color: "var(--accent-bnb)",
            border: "1px solid var(--accent-bnb-border)",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--accent-bnb)", flexShrink: 0 }} />
          <span className="topbar-chain-full">BNB Smart Chain</span>
          <span className="topbar-chain-compact" style={{ display: "none" }}>BSC</span>
        </div>
      </div>
    </header>
  );
}
