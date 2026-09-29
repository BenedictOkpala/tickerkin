import Link from "next/link";
import { notFound } from "next/navigation";
import { lookupByTicker } from "@/lens";

interface EquityOverviewPageProps {
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default async function EquityOverviewPage({ params }: EquityOverviewPageProps) {
  const { ticker } = await params;
  const result = lookupByTicker(ticker);

  if (!result.success) {
    notFound();
  }

  const { underlying, representations } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* 1. Quick Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Total Representations
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {representations.length}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Across {new Set(representations.map((r) => r.providerId)).size} distinct token providers
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Primary Blockchain
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            BNB Chain
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            BEP-20 standard · chainId 56
          </div>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            padding: "1rem 1.25rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ fontSize: "0.74rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
            Underlying Quote
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>
            {underlying.quoteCurrency}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
            Benchmark currency ({underlying.exchange})
          </div>
        </div>
      </div>

      {/* 2. Representations Lineage Summary */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.5rem",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
              Verified Tokenized Representations
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
              Live audit breakdown across issuers on BNB Smart Chain.
            </p>
          </div>

          <Link
            href={`/equity/${underlying.ticker}/kin`}
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: "#ffffff",
              backgroundColor: "var(--accent-primary)",
              padding: "0.4rem 0.85rem",
              borderRadius: "var(--radius-sm)",
            }}
          >
            Open Interactive Kin Map →
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {representations.map((rep) => (
            <div
              key={rep.contractAddress}
              style={{
                backgroundColor: "var(--bg-app)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "1.15rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {rep.tokenSymbol}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>
                    {rep.tokenName}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    backgroundColor: "var(--bg-surface)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {rep.providerName}
                </span>
              </div>

              <div style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                Issuer: {rep.issuer}
              </div>

              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-secondary)",
                  backgroundColor: "var(--bg-surface)",
                  padding: "0.45rem 0.65rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                Mechanism: <strong style={{ color: "var(--text-primary)" }}>{rep.economicModel.mechanism}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", paddingTop: "0.25rem" }}>
                <span>Contract:</span>
                <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                  {rep.contractAddress.slice(0, 10)}...{rep.contractAddress.slice(-6)}
                </code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
