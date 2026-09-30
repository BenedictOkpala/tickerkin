"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  readonly activeTicker?: string;
  readonly onCloseMobile?: () => void;
}

export function Sidebar({ activeTicker = "NVDA", onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const tickerUpper = activeTicker.toUpperCase();
  const basePath = `/equity/${tickerUpper}`;

  // Exact route matching to prevent "/" leaking active status
  const isExploreOverview = normalizedPath === "/";
  const isEquities = normalizedPath === "/equities";
  const isProviders = normalizedPath === "/providers";

  const isIntelligenceOverview =
    normalizedPath.toUpperCase() === basePath.toUpperCase();
  const isKinMap =
    normalizedPath.toUpperCase() === `${basePath}/kin`.toUpperCase();
  const isCompare =
    normalizedPath.toUpperCase() === `${basePath}/compare`.toUpperCase();
  const isEvidence =
    normalizedPath.toUpperCase() === `${basePath}/evidence`.toUpperCase();

  const isApi =
    normalizedPath === "/developers/api" || normalizedPath.startsWith("/developers");

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
            className={`sidebar-nav-link ${isExploreOverview ? "active" : ""}`}
          >
            <span>Overview</span>
          </Link>

          <Link
            href="/equities"
            onClick={onCloseMobile}
            className={`sidebar-nav-link ${isEquities ? "active" : ""}`}
          >
            <span>Equities</span>
          </Link>

          <Link
            href="/providers"
            onClick={onCloseMobile}
            className={`sidebar-nav-link ${isProviders ? "active" : ""}`}
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
            Intelligence ({tickerUpper})
          </div>

          <Link
            href={basePath}
            onClick={onCloseMobile}
            className={`sidebar-nav-link ${isIntelligenceOverview ? "active" : ""}`}
          >
            <span>Overview</span>
          </Link>

          <Link
            href={`${basePath}/kin`}
            onClick={onCloseMobile}
            className={`sidebar-nav-link ${isKinMap ? "active" : ""}`}
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
            href={`${basePath}/compare`}
            onClick={onCloseMobile}
            className={`sidebar-nav-link ${isCompare ? "active" : ""}`}
          >
            <span>Compare</span>
          </Link>

          <Link
            href={`${basePath}/evidence`}
            onClick={onCloseMobile}
            className={`sidebar-nav-link ${isEvidence ? "active" : ""}`}
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
            className={`sidebar-nav-link ${isApi ? "active" : ""}`}
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
