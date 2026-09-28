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
        maxWidth: "460px",
        margin: "0 auto",
        padding: "1rem 1.5rem",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Root Category Subtitle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "var(--text-muted)",
          marginBottom: "0.25rem",
        }}
      >
        <span>Traditional Underlying Equity</span>
        {equity.exchange && (
          <>
            <span>·</span>
            <span>{equity.exchange}</span>
          </>
        )}
      </div>

      {/* Main Stock Name */}
      <h2
        style={{
          fontSize: "1.35rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
          marginBottom: "0.25rem",
        }}
      >
        {equity.name}
      </h2>

      {/* Ticker, Currency, and Market Hours */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.6rem",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-surface)",
            padding: "0.1rem 0.45rem",
            borderRadius: "var(--radius-xs)",
            border: "1px solid var(--border-subtle)",
            fontSize: "0.82rem",
          }}
        >
          {equity.ticker}
        </span>

        <span>Quote: {equity.quoteCurrency}</span>

        {equity.marketHours && (
          <>
            <span style={{ color: "var(--border-hover)" }}>·</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: equity.marketHours.isOpen ? "var(--status-active)" : "var(--text-muted)",
                }}
              />
              <span style={{ fontSize: "0.75rem" }}>
                {equity.marketHours.isOpen ? "US Market Open" : "US Market Closed"}
              </span>
            </span>
          </>
        )}
      </div>

      {/* Kin Count Indicator */}
      <div
        style={{
          fontSize: "0.75rem",
          color: "var(--accent-primary)",
          backgroundColor: "var(--accent-primary-soft)",
          padding: "0.2rem 0.6rem",
          borderRadius: "var(--radius-xs)",
          border: "1px solid var(--accent-primary-border)",
          fontWeight: 500,
        }}
      >
        {representationCount} verified tokenized {representationCount === 1 ? "representation" : "representations"} on BNB Smart Chain
      </div>
    </div>
  );
}
