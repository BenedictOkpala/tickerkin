"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UnderlyingEquity } from "@/types/equity";

interface WorkspaceHeaderProps {
  readonly underlying: UnderlyingEquity;
  readonly representationCount: number;
}

export function WorkspaceHeader({ underlying, representationCount }: WorkspaceHeaderProps) {
  const pathname = usePathname();
  const ticker = underlying.ticker;

  const basePath = `/equity/${ticker}`;
  const isOverview = pathname === basePath;
  const isKin = pathname === `${basePath}/kin`;
  const isCompare = pathname === `${basePath}/compare`;
  const isEvidence = pathname === `${basePath}/evidence`;

  const tabStyle = (active: boolean) => ({
    padding: "0.55rem 1rem",
    fontSize: "0.85rem",
    fontWeight: active ? 700 : 500,
    color: active ? "var(--accent-primary)" : "var(--text-secondary)",
    borderBottom: active ? "2px solid var(--accent-primary)" : "2px solid transparent",
    textDecoration: "none",
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
  });

  return (
    <div
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: "1.25rem 1.5rem 0",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* 1. Header Row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              {underlying.ticker}
            </span>
            <span style={{ fontSize: "1.15rem", color: "var(--text-secondary)", fontWeight: 600 }}>
              {underlying.name}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              marginTop: "0.25rem",
            }}
          >
            <span>{underlying.exchange}</span>
            <span>·</span>
            <span>Quote Currency: {underlying.quoteCurrency}</span>
            <span>·</span>
            <span>US Trading Session: 09:30–16:00 ET</span>
          </div>
        </div>

        {/* Representation Count Badge */}
        <span
          style={{
            fontSize: "0.76rem",
            fontWeight: 600,
            color: "var(--accent-primary)",
            backgroundColor: "var(--accent-primary-soft)",
            padding: "0.25rem 0.65rem",
            borderRadius: "var(--radius-xs)",
            border: "1px solid var(--accent-primary-border)",
          }}
        >
          {representationCount} verified {representationCount === 1 ? "representation" : "representations"} on BNB Smart Chain
        </span>
      </div>

      {/* 2. Workspace Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          borderTop: "1px solid var(--border-subtle)",
          overflowX: "auto",
        }}
      >
        <Link href={basePath} style={tabStyle(isOverview)}>
          <span>Overview</span>
        </Link>

        <Link href={`${basePath}/kin`} style={tabStyle(isKin)}>
          <span>Kin Map</span>
          <span
            style={{
              fontSize: "0.65rem",
              padding: "0.1rem 0.35rem",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "var(--accent-primary-soft)",
              color: "var(--accent-primary)",
              fontWeight: 700,
            }}
          >
            Signature
          </span>
        </Link>

        <Link href={`${basePath}/compare`} style={tabStyle(isCompare)}>
          <span>Compare</span>
        </Link>

        <Link href={`${basePath}/evidence`} style={tabStyle(isEvidence)}>
          <span>Evidence</span>
        </Link>
      </div>
    </div>
  );
}
