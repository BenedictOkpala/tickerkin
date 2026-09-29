"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { VERIFIED_REGISTRY } from "@/lens/registry";

export default function EquitiesPage() {
  const [filter, setFilter] = useState("");

  const equities = VERIFIED_REGISTRY.map((entry) => ({
    ticker: entry.equity.ticker,
    name: entry.equity.name,
    exchange: entry.equity.exchange ?? "NASDAQ",
    quoteCurrency: entry.equity.quoteCurrency,
    representationCount: entry.providerRecords.length,
    providers: entry.providerRecords.map((p) => p.providerId.toUpperCase()),
    contracts: entry.providerRecords.map((p) => p.record.contractAddress),
  }));

  const filtered = equities.filter((e) =>
    e.ticker.toLowerCase().includes(filter.toLowerCase()) ||
    e.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <AppShell activeTicker="NVDA">
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "2rem 2rem 3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.75rem",
        }}
      >
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--accent-primary)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Verified Registry
            </div>
            <h1
              style={{
                fontSize: "1.85rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.025em",
                marginTop: "0.25rem",
              }}
            >
              Equities Explorer
            </h1>
            <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
              Explore underlying traditional equities indexed with verified tokenized representations on BNB Smart Chain.
            </p>
          </div>

          {/* Search Filter */}
          <div style={{ minWidth: "260px" }}>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by ticker or name..."
              style={{
                width: "100%",
                padding: "0.45rem 0.75rem",
                fontSize: "0.85rem",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-surface)",
                border: "1px solid var(--border-card)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Financial Data Table */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr
                style={{
                  backgroundColor: "var(--bg-app)",
                  borderBottom: "1px solid var(--border-card)",
                  color: "var(--text-muted)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: "0.85rem 1.25rem" }}>Ticker</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Company Name</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Exchange</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Quote</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Verified Representations</th>
                <th style={{ padding: "0.85rem 1.25rem" }}>Providers on BSC</th>
                <th style={{ padding: "0.85rem 1.25rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.ticker}
                  style={{
                    borderBottom: "1px solid var(--border-subtle)",
                    transition: "background-color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-card-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <Link
                      href={`/equity/${item.ticker}`}
                      style={{
                        fontWeight: 800,
                        fontSize: "0.95rem",
                        color: "var(--accent-primary)",
                        textDecoration: "none",
                      }}
                    >
                      {item.ticker}
                    </Link>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-primary)", fontWeight: 600 }}>
                    {item.name}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                    {item.exchange}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                    {item.quoteCurrency}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 600,
                        color: "var(--accent-primary)",
                        backgroundColor: "var(--accent-primary-soft)",
                        padding: "0.2rem 0.55rem",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--accent-primary-border)",
                      }}
                    >
                      {item.representationCount} {item.representationCount === 1 ? "representation" : "representations"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                    {item.providers.join(", ")}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                      <Link
                        href={`/equity/${item.ticker}/kin`}
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: "#ffffff",
                          backgroundColor: "var(--accent-primary)",
                          padding: "0.3rem 0.65rem",
                          borderRadius: "var(--radius-xs)",
                        }}
                      >
                        Kin Map
                      </Link>
                      <Link
                        href={`/equity/${item.ticker}`}
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          color: "var(--text-secondary)",
                          backgroundColor: "var(--bg-app)",
                          border: "1px solid var(--border-subtle)",
                          padding: "0.3rem 0.65rem",
                          borderRadius: "var(--radius-xs)",
                        }}
                      >
                        Overview
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
