import { notFound } from "next/navigation";
import { lookupByTicker } from "@/lens";

interface ComparePageProps {
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { ticker } = await params;
  const result = lookupByTicker(ticker);

  if (!result.success) {
    notFound();
  }

  const { underlying, representations } = result;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Compare Header */}
      <div>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
          Representation Comparison Matrix — {underlying.ticker}
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
          Side-by-side technical comparison of token mechanics, corporate actions, and provenance across providers on BNB Smart Chain.
        </p>
      </div>

      {/* Comparison Table */}
      <div
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          overflowX: "auto",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "var(--bg-app)", borderBottom: "1px solid var(--border-card)" }}>
              <th style={{ padding: "0.9rem 1.25rem", width: "240px", color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>
                Specification / Dimension
              </th>
              {representations.map((rep) => (
                <th key={rep.contractAddress} style={{ padding: "0.9rem 1.25rem", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.05rem" }}>
                  <div>{rep.tokenSymbol}</div>
                  <div style={{ fontSize: "0.74rem", fontWeight: 500, color: "var(--text-muted)" }}>{rep.providerName}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Issuer</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-primary)" }}>{r.issuer}</td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Chain & Standard</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-primary)" }}>
                  {r.chain} ({r.tokenStandard}) · {r.decimals}d
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Economic Mechanism</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem" }}>
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--accent-primary)",
                      backgroundColor: "var(--accent-primary-soft)",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--accent-primary-border)",
                    }}
                  >
                    {r.economicModel.mechanism}
                  </span>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Mechanism Description</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  {r.economicModel.description}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Dividend Handling</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem", color: "var(--text-primary)", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                  {"dividendHandling" in r.economicModel ? r.economicModel.dividendHandling : "standard"}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Contract Address</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem" }}>
                  <a
                    href={`https://bscscan.com/token/${r.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.78rem",
                      color: "var(--accent-primary)",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span>{r.contractAddress.slice(0, 8)}...{r.contractAddress.slice(-6)}</span>
                    <span>↗</span>
                  </a>
                </td>
              ))}
            </tr>

            <tr>
              <td style={{ padding: "0.85rem 1.25rem", fontWeight: 600, color: "var(--text-secondary)" }}>Audit Provenance</td>
              {representations.map((r) => (
                <td key={r.contractAddress} style={{ padding: "0.85rem 1.25rem" }}>
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
                    {r.provenance.sourceClass} · {r.provenance.confidence} CONFIDENCE
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
