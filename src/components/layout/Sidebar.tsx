"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  readonly activeTicker?: string;
  readonly onCloseMobile?: () => void;
}

export function Sidebar({ activeTicker = "NVDA", onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  const isExploreOverview = pathname === "/";
  const isEquities = pathname === "/equities";
  const isProviders = pathname === "/providers";
  const isKinMap = pathname.includes("/kin");
  const isCompare = pathname.includes("/compare");
  const isEvidence = pathname.includes("/evidence");
  const isApi = pathname.startsWith("/developers");

  const linkStyle = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.55rem 0.75rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.84rem",
    fontWeight: active ? 600 : 500,
    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
    backgroundColor: active ? "var(--accent-primary-soft)" : "transparent",
    borderLeft: active ? "3px solid var(--accent-primary)" : "3px solid transparent",
    transition: "all 0.15s ease",
    textDecoration: "none",
  });

  return (
    <aside
      style={{
        width: "240px",
        height: "100%",
        minHeight: "100vh",
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-subtle)",
        display: "flex",
        flexDirection: "column",
        padding: "1.25rem 1rem",
        gap: "1.5rem",
      }}
    >
      {/* 1. Brand Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0 0.25rem" }}>
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "var(--radius-xs)",
            backgroundColor: "var(--accent-primary-soft)",
            border: "1px solid var(--accent-primary-border)",
            color: "var(--accent-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: "0.9rem",
            letterSpacing: "-0.02em",
          }}
        >
          TK
        </div>
        <div>
          <div
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            TickerKin
          </div>
          <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
            Tokenized Equity Intelligence
          </div>
        </div>
      </div>

      {/* 2. Navigation Sections */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
        {/* Section: EXPLORE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "0 0.5rem 0.25rem",
            }}
          >
            Explore
          </div>

          <Link
            href="/"
            onClick={onCloseMobile}
            style={linkStyle(isExploreOverview)}
          >
            <span>Overview</span>
          </Link>

          <Link
            href="/equities"
            onClick={onCloseMobile}
            style={linkStyle(isEquities)}
          >
            <span>Equities</span>
          </Link>

          <Link
            href="/providers"
            onClick={onCloseMobile}
            style={linkStyle(isProviders)}
          >
            <span>Providers</span>
          </Link>
        </div>

        {/* Section: INTELLIGENCE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "0 0.5rem 0.25rem",
            }}
          >
            Intelligence ({activeTicker})
          </div>

          <Link
            href={`/equity/${activeTicker}/kin`}
            onClick={onCloseMobile}
            style={linkStyle(isKinMap)}
          >
            <span>Kin Map</span>
            <span
              style={{
                fontSize: "0.65rem",
                padding: "0.1rem 0.35rem",
                borderRadius: "var(--radius-xs)",
                backgroundColor: "var(--accent-primary-soft)",
                color: "var(--accent-primary)",
                fontWeight: 600,
              }}
            >
              Core
            </span>
          </Link>

          <Link
            href={`/equity/${activeTicker}/compare`}
            onClick={onCloseMobile}
            style={linkStyle(isCompare)}
          >
            <span>Compare</span>
          </Link>

          <Link
            href={`/equity/${activeTicker}/evidence`}
            onClick={onCloseMobile}
            style={linkStyle(isEvidence)}
          >
            <span>Evidence</span>
          </Link>
        </div>

        {/* Section: DEVELOPERS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              padding: "0 0.5rem 0.25rem",
            }}
          >
            Developers
          </div>

          <Link
            href="/developers/api"
            onClick={onCloseMobile}
            style={linkStyle(isApi)}
          >
            <span>RWA Lens API</span>
          </Link>
        </div>
      </nav>

      {/* 3. Footer info */}
      <div
        style={{
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "0.85rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 600,
              padding: "0.12rem 0.45rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--accent-bnb-soft)",
              color: "var(--accent-bnb)",
              border: "1px solid var(--accent-bnb-border)",
            }}
          >
            BNB Chain
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>chainId: 56</span>
        </div>
        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
          Powered by RWA Lens Engine
        </div>
      </div>
    </aside>
  );
}
