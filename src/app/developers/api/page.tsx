"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";

interface EndpointInfo {
  method: "GET";
  path: string;
  summary: string;
  description: string;
  params?: { name: string; type: string; required: boolean; description: string }[];
  exampleRequest: string;
  sampleResponse: Record<string, unknown>;
}

const ENDPOINTS: EndpointInfo[] = [
  {
    method: "GET",
    path: "/api/lens",
    summary: "Service Health & Engine Metadata",
    description: "Returns the operational health status, API version, supported chains, and normalization engine identity.",
    exampleRequest: "/api/lens",
    sampleResponse: {
      status: "ok",
      service: "rwa-lens",
      version: "1.0.0",
      chain: "bsc",
      chainId: 56,
      supportedProviders: ["ondo", "bstocks", "xstocks"],
      verifiedTokensCount: 4,
    },
  },
  {
    method: "GET",
    path: "/api/lens/ticker/{ticker}",
    summary: "Resolve Tokenized Representations by Underlying Ticker",
    description: "Resolves all verified RWA representations across supported tokenization providers for a given equity ticker (e.g., NVDA, AAPL, TSLA), including normalized factor dynamics, legal wrappers, and canonical evidence.",
    params: [
      {
        name: "ticker",
        type: "string",
        required: true,
        description: "Canonical underlying equity ticker (case-insensitive, e.g. NVDA)",
      },
    ],
    exampleRequest: "/api/lens/ticker/NVDA",
    sampleResponse: {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      market: "NASDAQ",
      currency: "USD",
      representationsCount: 3,
      representations: [
        {
          provider: "ondo",
          providerName: "Ondo Finance",
          tokenSymbol: "NVDAon",
          chain: "bsc",
          contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
          legalStructure: "tokenized_security",
          backingType: "1:1_custodied",
          pricingMechanism: "oracle_nav",
          transferRestrictions: "kyc_whitelisted",
          yieldMechanic: "distributing",
          settlementWindow: "t_plus_1",
          factorDynamics: {
            liveFactorAvailable: true,
            currentFactor: 1.0,
            factorType: "fixed_unit",
            provenance: {
              source: "binance_web3_rwa",
              confidence: "high",
              evidenceType: "public_enrichment",
            },
          },
        },
      ],
    },
  },
  {
    method: "GET",
    path: "/api/lens/ticker/{ticker}/comparison",
    summary: "Normalized Cross-Representation Comparison Matrix",
    description: "Returns the normalized cross-representation comparison matrix, including share-equivalent units, benchmark reference value, secondary DEX spot prices, and reference deviations for an equity.",
    params: [
      {
        name: "ticker",
        type: "string",
        required: true,
        description: "Canonical underlying equity ticker (e.g. NVDA)",
      },
    ],
    exampleRequest: "/api/lens/ticker/NVDA/comparison",
    sampleResponse: {
      underlying: {
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        exchange: "NASDAQ",
        quoteCurrency: "USD",
        referencePriceUSD: 224.15,
        marketStatus: "MARKET_CLOSED",
      },
      representations: [
        {
          providerId: "ondo",
          tokenSymbol: "NVDAon",
          economicMechanism: "Auto-DRIP (Scaled UI)",
          normalizationStatus: "AVAILABLE",
          accountingFactor: 1.001715,
          shareEquivalentPerToken: 1.001715,
          referenceValuePerTokenUSD: 224.53,
          dexMarketPriceUSD: 224.50,
          referenceDeviationPercent: -0.015,
        },
        {
          providerId: "bstocks",
          tokenSymbol: "NVDAB",
          economicMechanism: "Multiplier Model",
          normalizationStatus: "AVAILABLE",
          accountingFactor: 1.000778,
          shareEquivalentPerToken: 1.000778,
          referenceValuePerTokenUSD: 224.32,
          dexMarketPriceUSD: 223.93,
          referenceDeviationPercent: -0.178,
        },
        {
          providerId: "xstocks",
          tokenSymbol: "NVDAx",
          economicMechanism: "Redemption-Rate Model",
          normalizationStatus: "UNAVAILABLE",
          unavailabilityReason: "Verified BSC redemption/conversion factor unavailable. TickerKin will not assume 1 token equals 1 share.",
        },
      ],
    },
  },
  {
    method: "GET",
    path: "/api/lens/contract/{address}",
    summary: "Resolve Equity Lineage by Contract Address",
    description: "Performs reverse resolution of an on-chain token address on BNB Smart Chain to discover its underlying equity lineage, issuer identity, and legal parameters.",
    params: [
      {
        name: "address",
        type: "string",
        required: true,
        description: "EVM contract address on BSC (case-insensitive 0x... hex string)",
      },
    ],
    exampleRequest: "/api/lens/contract/0xa9ee28c80f960b889dfbd1902055218cba016f75",
    sampleResponse: {
      found: true,
      contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
      chain: "bsc",
      chainId: 56,
      provider: "ondo",
      underlyingTicker: "NVDA",
      underlyingName: "NVIDIA Corporation",
      tokenSymbol: "NVDAon",
      legalStructure: "tokenized_security",
      verificationStatus: "verified",
    },
  },
];

export default function DevelopersApiPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(1);
  const [liveResponse, setLiveResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testUrl, setTestUrl] = useState<string>("/api/lens/ticker/NVDA");

  const endpoint = ENDPOINTS[selectedEndpoint];

  const executeLiveRequest = async (url: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(url);
      const data = await res.json();
      setLiveResponse(JSON.stringify(data, null, 2));
    } catch (err: unknown) {
      setLiveResponse(JSON.stringify({ error: "Failed to fetch live API response", details: String(err) }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell activeTicker="NVDA">
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        {/* Page Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--accent-primary)",
                backgroundColor: "var(--accent-primary-soft)",
                border: "1px solid var(--accent-primary-border)",
                padding: "0.15rem 0.5rem",
                borderRadius: "var(--radius-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Developer Surface
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>REST API v1.0</span>
          </div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              letterSpacing: "-0.025em",
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            RWA Lens Public API
          </h1>
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--text-secondary)",
              lineHeight: 1.5,
              maxWidth: "800px",
              margin: 0,
            }}
          >
            RWA Lens provides deterministic normalization and identity resolution for tokenized real-world assets on BNB Smart Chain. Developers can consume canonical factor dynamics, legal parameters, and multi-provider lineage programmatically.
          </p>
        </div>

        {/* Integration Architecture Card */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem 1.5rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
              Authentication
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Public / No API Key Required
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              Read-only endpoints with rate-limiting protection.
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
              Target Network
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)" }}>
              BNB Smart Chain (Chain ID: 56)
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              EVM address normalization and case-insensitive matching.
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.35rem" }}>
              Data Provenance
            </div>
            <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)" }}>
              Cryptographic & Regulatory Evidence
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
              Verified against Binance Web3 RWA & audited prospectuses.
            </div>
          </div>
        </div>

        {/* Interactive Endpoint Explorer */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "1.5rem", alignItems: "start" }}>
          {/* Endpoint List Selector */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "0.5rem 0.5rem 0.25rem" }}>
              Available Endpoints
            </div>
            {ENDPOINTS.map((ep, idx) => {
              const active = selectedEndpoint === idx;
              return (
                <button
                  key={ep.path}
                  type="button"
                  onClick={() => {
                    setSelectedEndpoint(idx);
                    setTestUrl(ep.exampleRequest);
                    setLiveResponse(null);
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "0.25rem",
                    padding: "0.65rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: active ? "var(--accent-primary-soft)" : "transparent",
                    border: active ? "1px solid var(--accent-primary-border)" : "1px solid transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 800,
                        backgroundColor: "var(--bg-secondary)",
                        color: "var(--text-primary)",
                        padding: "0.1rem 0.35rem",
                        borderRadius: "var(--radius-xs)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      {ep.method}
                    </span>
                    <span style={{ fontSize: "0.82rem", fontWeight: active ? 700 : 600, color: active ? "var(--accent-primary)" : "var(--text-primary)", fontFamily: "monospace" }}>
                      {ep.path}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: 1.2 }}>
                    {ep.summary}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Endpoint Documentation & Live Console */}
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Active Endpoint Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    backgroundColor: "var(--accent-primary)",
                    color: "#FFFFFF",
                    padding: "0.2rem 0.5rem",
                    borderRadius: "var(--radius-xs)",
                  }}
                >
                  {endpoint.method}
                </span>
                <span style={{ fontSize: "1.1rem", fontWeight: 700, fontFamily: "monospace", color: "var(--text-primary)" }}>
                  {endpoint.path}
                </span>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", marginTop: "0.25rem" }}>
                {endpoint.summary}
              </div>
              <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                {endpoint.description}
              </p>
            </div>

            {/* Parameters Table if any */}
            {endpoint.params && endpoint.params.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Path Parameters
                </div>
                <div style={{ border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                    <thead>
                      <tr style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                        <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Parameter</th>
                        <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Type</th>
                        <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Required</th>
                        <th style={{ padding: "0.5rem 0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.params.map((p) => (
                        <tr key={p.name} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                          <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600, fontFamily: "monospace", color: "var(--accent-primary)" }}>{p.name}</td>
                          <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>{p.type}</td>
                          <td style={{ padding: "0.5rem 0.75rem", color: p.required ? "var(--text-primary)" : "var(--text-muted)", fontWeight: p.required ? 600 : 400 }}>
                            {p.required ? "Yes" : "No"}
                          </td>
                          <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-secondary)" }}>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Interactive Request Tester */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Live Request Test
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  Executes against current running host
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  style={{
                    flex: 1,
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    padding: "0.55rem 0.75rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => executeLiveRequest(testUrl)}
                  disabled={isLoading}
                  style={{
                    padding: "0.55rem 1.1rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--accent-primary)",
                    color: "#FFFFFF",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isLoading ? "Executing..." : "Send Request"}
                </button>
              </div>

              {/* Response Viewer */}
              <div
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1rem",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  color: "var(--text-primary)",
                  maxHeight: "340px",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                }}
              >
                {liveResponse ? (
                  liveResponse
                ) : (
                  <span style={{ color: "var(--text-muted)" }}>
                    {"// Sample Response preview (Click \"Send Request\" to fetch live):\n"}
                    {JSON.stringify(endpoint.sampleResponse, null, 2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Model Context Protocol (MCP) Agent Interface Section */}
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: "var(--accent-primary)",
                    backgroundColor: "var(--accent-primary-soft)",
                    border: "1px solid var(--accent-primary-border)",
                    padding: "0.15rem 0.45rem",
                    borderRadius: "var(--radius-xs)",
                    textTransform: "uppercase",
                  }}
                >
                  Agent Tooling
                </span>
                <span style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  Model Context Protocol (MCP) Interface
                </span>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginTop: "0.25rem", marginBottom: 0, maxWidth: "760px" }}>
                Autonomous AI agents and LLMs can query RWA Lens natively using the Model Context Protocol over stdio transport.
              </p>
            </div>

            <code
              style={{
                fontSize: "0.78rem",
                backgroundColor: "var(--bg-secondary)",
                padding: "0.35rem 0.65rem",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-mono)",
              }}
            >
              npm run mcp
            </code>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "0.75rem",
              marginTop: "0.25rem",
            }}
          >
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "monospace", color: "var(--accent-primary)" }}>
                resolve_equity
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                Discover token representations for a ticker
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "monospace", color: "var(--accent-primary)" }}>
                resolve_contract
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                Reverse-resolve BSC contract address
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "monospace", color: "var(--accent-primary)" }}>
                compare_representations
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                Compare economic models across providers
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "monospace", color: "var(--accent-primary)" }}>
                get_evidence
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                Retrieve claim-scoped audit trails
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "0.75rem", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "monospace", color: "var(--accent-primary)" }}>
                list_equities
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-secondary)", marginTop: "0.15rem" }}>
                List verified equities in RWA Lens
              </div>
            </div>
          </div>
        </div>

        {/* Quick Back to Explorer CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Need interactive visual exploration?
          </div>
          <Link
            href="/equity/NVDA/kin"
            style={{
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "var(--accent-primary)",
              textDecoration: "none",
            }}
          >
            Launch NVDA Kin Map →
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
