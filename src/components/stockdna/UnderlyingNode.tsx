import type { UnderlyingEquity } from "@/types/equity";

interface UnderlyingNodeProps {
  readonly equity: UnderlyingEquity;
  readonly representationCount: number;
}

export function UnderlyingNode({ equity, representationCount }: UnderlyingNodeProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        maxWidth: "480px",
        margin: "0 auto",
        padding: "1.25rem 1.5rem",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--accent-gold-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 0 25px rgba(240, 185, 11, 0.08)",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Top Identity Chip */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          color: "var(--accent-gold)",
          marginBottom: "0.4rem",
        }}
      >
        <span>🏛️ Traditional Underlying Asset</span>
        <span>•</span>
        <span style={{ color: "var(--text-secondary)" }}>{equity.exchange ?? "US Equity"}</span>
      </div>

      {/* Main Stock Title */}
      <h2
        style={{
          fontSize: "1.6rem",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          marginBottom: "0.2rem",
        }}
      >
        {equity.name}
      </h2>

      {/* Ticker & Market Details */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.75rem",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-surface)",
            padding: "0.15rem 0.5rem",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {equity.ticker}
        </span>
        <span>Quote: {equity.quoteCurrency}</span>
        <span>•</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: equity.marketHours?.isOpen ? "var(--accent-green)" : "var(--text-muted)",
            }}
          />
          {equity.marketHours?.isOpen ? "US Market Open" : "US Market Closed"}
        </span>
      </div>

      {/* Verified Count Banner */}
      <div
        style={{
          fontSize: "0.8rem",
          padding: "0.3rem 0.75rem",
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--accent-gold-soft)",
          color: "var(--accent-gold)",
          border: "1px solid var(--accent-gold-border)",
          fontWeight: 600,
        }}
      >
        {representationCount} Verified Tokenized {representationCount === 1 ? "Representation" : "Representations"} on BNB Chain
      </div>
    </div>
  );
}
