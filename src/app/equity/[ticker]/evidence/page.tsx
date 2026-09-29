import { notFound } from "next/navigation";
import { lookupByTicker } from "@/lens";

interface EvidencePageProps {
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default async function EvidencePage({ params }: EvidencePageProps) {
  const { ticker } = await params;
  const result = lookupByTicker(ticker);

  if (!result.success) {
    notFound();
  }

  const { underlying, representations } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Verification & Provenance Audit Log — {underlying.ticker}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
          Canonical evidence records and on-chain verification trails supporting the RWA Lens normalized data model.
        </p>
      </div>

      {/* 1. Underlying Equity Evidence Record */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          padding: "1.35rem 1.5rem",
          boxShadow: "var(--shadow-card)",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
            Underlying Equity Benchmark Feed ({underlying.ticker})
          </div>
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--accent-primary)",
              backgroundColor: "var(--accent-primary-soft)",
              padding: "0.15rem 0.45rem",
              borderRadius: "var(--radius-xs)",
              border: "1px solid var(--accent-primary-border)",
            }}
          >
            {underlying.provenance.sourceClass} · {underlying.provenance.confidence} CONFIDENCE
          </span>
        </div>

        <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          Source: <strong style={{ color: "var(--text-primary)" }}>{underlying.provenance.sourceName}</strong>
        </div>

        {underlying.provenance.sourceRef && (
          <a
            href={underlying.provenance.sourceRef}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.78rem", color: "var(--accent-primary)", wordBreak: "break-all" }}
          >
            {underlying.provenance.sourceRef} ↗
          </a>
        )}

        {underlying.provenance.notes && (
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5, backgroundColor: "var(--bg-app)", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-sm)" }}>
            {underlying.provenance.notes}
          </p>
        )}
      </div>

      {/* 2. Representation Evidence Records */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
          Representation Issuer Evidence
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {representations.map((rep) => (
            <div
              key={rep.contractAddress}
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-lg)",
                padding: "1.35rem 1.5rem",
                boxShadow: "var(--shadow-card)",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>
                    {rep.tokenSymbol}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginLeft: "0.4rem" }}>
                    ({rep.providerName})
                  </span>
                </div>

                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    backgroundColor: "var(--bg-app)",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  {rep.provenance.sourceClass} · {rep.provenance.confidence} CONFIDENCE
                </span>
              </div>

              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Source: <strong style={{ color: "var(--text-primary)" }}>{rep.provenance.sourceName}</strong>
              </div>

              {rep.provenance.sourceRef && (
                <a
                  href={rep.provenance.sourceRef}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "0.78rem", color: "var(--accent-primary)", wordBreak: "break-all" }}
                >
                  {rep.provenance.sourceRef} ↗
                </a>
              )}

              {rep.provenance.notes && (
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5, backgroundColor: "var(--bg-app)", padding: "0.65rem 0.85rem", borderRadius: "var(--radius-sm)" }}>
                  {rep.provenance.notes}
                </p>
              )}

              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", paddingTop: "0.25rem", borderTop: "1px solid var(--border-subtle)" }}>
                Contract on BSC: <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>{rep.contractAddress}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
