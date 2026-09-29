import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getProvidersCatalog } from "@/lens";

export default function ProvidersPage() {
  const providers = getProvidersCatalog();

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
          gap: "2rem",
        }}
      >
        {/* Page Header */}
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
            Ecosystem Index
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
            Tokenized Equity Providers
          </h1>
          <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginTop: "0.25rem", maxWidth: "800px" }}>
            Factual overview of tokenization issuers and smart contract mechanisms indexed and audited on BNB Smart Chain.
          </p>

          {/* Explicit Scope Notice */}
          <div
            style={{
              marginTop: "0.75rem",
              padding: "0.6rem 0.85rem",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              maxWidth: "800px",
            }}
          >
            <strong style={{ color: "var(--text-primary)" }}>Indexing Scope:</strong> TickerKin currently indexes a curated set of verified BNB Smart Chain tokenized-equity representations. Counts reflect verified assets in RWA Lens rather than total multi-chain issuance.
          </div>
        </div>

        {/* Provider Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {providers.map((p) => (
            <div
              key={p.id}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem 1.6rem",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {p.name}
                  </h2>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                    Issuer: {p.issuer}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--accent-primary)",
                    backgroundColor: "var(--accent-primary-soft)",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--accent-primary-border)",
                  }}
                >
                  {p.verifiedRepresentationCount} Verified in Lens
                </span>
              </div>

              {/* Economic Mechanism */}
              <div
                style={{
                  backgroundColor: "var(--bg-app)",
                  padding: "0.75rem 0.9rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Economic Mechanism
                </span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {p.economicMechanism}
                </span>
              </div>

              {/* Details List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", fontSize: "0.8rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Supported Tickers in Lens:</span>
                  <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {p.supportedTickers.join(", ")}
                  </span>
                </div>

                {p.secondaryDex && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Primary DEX:</span>
                    <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
                      {p.secondaryDex}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "auto", paddingTop: "0.5rem" }}>
                {p.sourceRef && (
                  <a
                    href={p.sourceRef}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      textAlign: "center",
                      backgroundColor: "var(--bg-app)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      padding: "0.45rem 0.75rem",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    Issuer Docs ↗
                  </a>
                )}

                <Link
                  href={`/equity/NVDA/kin`}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    backgroundColor: "var(--accent-primary)",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    padding: "0.45rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  View Kin Map
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
