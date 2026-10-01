import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { getEquitiesCatalog, getProvidersCatalog, buildEquityComparisonAsync } from "@/lens";
import { InteractiveComparison } from "@/components/comparison/InteractiveComparison";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OverviewPage() {
  const equities = getEquitiesCatalog();
  const providers = getProvidersCatalog();
  const nvdaComparison = await buildEquityComparisonAsync("NVDA");

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
          gap: "2.5rem",
        }}
      >
        {/* 1. Primary Interactive Showcase: First Viewport Hero + Kin Motif + Comparison Matrix + Calculator */}
        {nvdaComparison && (
          <InteractiveComparison matrix={nvdaComparison} />
        )}

        {/* 3. Compact Resolution Model Explainer */}
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem 1.75rem",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "1rem",
              letterSpacing: "-0.01em",
            }}
          >
            How TickerKin Resolves & Normalizes Tokenized Equities
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "var(--bg-app)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.25rem" }}>
                STEP 1
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                Underlying Equity
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                Identify the traditional off-chain company (e.g. NVIDIA Corporation / NVDA) verified via Pyth oracles.
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-app)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.25rem" }}>
                STEP 2
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                Representations
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                Discover distinct BEP-20 tokens issued across providers on BNB Smart Chain (NVDAon, NVDAB, NVDAx).
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-app)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.25rem" }}>
                STEP 3
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                Economic Models
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                Distinguish Auto-DRIP Scaled UI vs Multiplier vs Redemption Rate mechanisms without flattening.
              </div>
            </div>

            <div
              style={{
                backgroundColor: "var(--bg-app)",
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--accent-primary)", marginBottom: "0.25rem" }}>
                STEP 4
              </div>
              <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
                Evidence Records
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                Inspect source classes, confidence ratings, contract bytecode audits, and live indexer provenance.
              </div>
            </div>
          </div>
        </div>

        {/* 4. Explore Equities Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Verified Equities
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                Curated assets with verified tokenized representations on BNB Smart Chain.
              </p>
            </div>

            <Link
              href="/equities"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--accent-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>View All Equities</span>
              <span>→</span>
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {equities.map((item) => (
              <div
                key={item.ticker}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.4rem",
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <div
                      style={{
                        display: "inline-block",
                        fontWeight: 800,
                        fontSize: "1.25rem",
                        color: "var(--text-primary)",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item.ticker}
                    </div>
                    <div style={{ fontSize: "0.88rem", color: "var(--text-secondary)", fontWeight: 500, marginTop: "0.1rem" }}>
                      {item.name}
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      color: "var(--accent-primary)",
                      backgroundColor: "var(--accent-primary-soft)",
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-xs)",
                      border: "1px solid var(--accent-primary-border)",
                    }}
                  >
                    {item.representationCount} {item.representationCount === 1 ? "Rep" : "Reps"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    paddingTop: "0.4rem",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <span>Providers:</span>
                  <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {item.providerIds.join(", ").toUpperCase()}
                  </span>
                  <span>·</span>
                  <span>{item.exchange} ({item.quoteCurrency})</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "auto", paddingTop: "0.5rem" }}>
                  {item.representationCount > 1 ? (
                    <>
                      <Link
                        href={`/equity/${item.ticker}/kin`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          backgroundColor: "var(--accent-primary)",
                          color: "#ffffff",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          padding: "0.45rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          textDecoration: "none",
                        }}
                      >
                        Explore Kin Map
                      </Link>
                      <Link
                        href={`/equity/${item.ticker}`}
                        style={{
                          textAlign: "center",
                          backgroundColor: "var(--bg-app)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          padding: "0.45rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          textDecoration: "none",
                        }}
                      >
                        Overview
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/equity/${item.ticker}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          backgroundColor: "var(--accent-primary)",
                          color: "#ffffff",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          padding: "0.45rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          textDecoration: "none",
                        }}
                      >
                        View Equity
                      </Link>
                      <Link
                        href={`/equity/${item.ticker}/evidence`}
                        style={{
                          textAlign: "center",
                          backgroundColor: "var(--bg-app)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          padding: "0.45rem 0.75rem",
                          borderRadius: "var(--radius-sm)",
                          textDecoration: "none",
                        }}
                      >
                        Evidence
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Verified Providers Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-primary)" }}>
                Supported Providers
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                Issuers and tokenization mechanisms currently indexed in RWA Lens.
              </p>
            </div>

            <Link
              href="/providers"
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--accent-primary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span>Explore Providers</span>
              <span>→</span>
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {providers.map((p) => (
              <div
                key={p.id}
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1.25rem 1.4rem",
                  boxShadow: "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.6rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                    {p.name}
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
                    {p.verifiedRepresentationCount} Verified in Lens
                  </span>
                </div>

                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                  Issuer: {p.issuer}
                </div>

                <div
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--bg-app)",
                    padding: "0.45rem 0.65rem",
                    borderRadius: "var(--radius-xs)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  Mechanism: <strong style={{ color: "var(--text-primary)" }}>{p.economicMechanism}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
