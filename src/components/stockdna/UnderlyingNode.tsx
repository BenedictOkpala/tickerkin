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
        maxWidth: "520px",
        margin: "0 auto",
        padding: "1.25rem 1.75rem",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Root Category Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontSize: "0.74rem",
          fontWeight: 700,
          color: "var(--accent-primary)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: "0.35rem",
        }}
      >
        <span>Underlying Traditional Asset</span>
        {equity.exchange && (
          <>
            <span>·</span>
            <span>{equity.exchange}</span>
          </>
        )}
      </div>

      {/* Main Stock Company Name */}
      <h2
        style={{
          fontSize: "1.85rem",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          marginBottom: "0.45rem",
          lineHeight: 1.2,
        }}
      >
        {equity.name}
      </h2>

      {/* Ticker & Quote Currency Meta Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.5rem",
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          marginBottom: "0.65rem",
        }}
      >
        <span
          style={{
            fontWeight: 700,
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-surface)",
            padding: "0.15rem 0.55rem",
            borderRadius: "var(--radius-xs)",
            border: "1px solid var(--border-card)",
            fontSize: "0.88rem",
            letterSpacing: "0.02em",
          }}
        >
          {equity.ticker}
        </span>

        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
          Quote: {equity.quoteCurrency}
        </span>

        {equity.marketHours?.timezone && (
          <>
            <span style={{ color: "var(--border-card)" }}>·</span>
            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
              US Session: 09:30–16:00 ET
            </span>
          </>
        )}
      </div>

      {/* Verified Kin Count Badge */}
      <div
        style={{
          fontSize: "0.78rem",
          color: "var(--accent-primary)",
          backgroundColor: "var(--accent-primary-soft)",
          padding: "0.25rem 0.75rem",
          borderRadius: "var(--radius-xs)",
          border: "1px solid var(--accent-primary-border)",
          fontWeight: 600,
          letterSpacing: "-0.01em",
        }}
      >
        {representationCount} verified {representationCount === 1 ? "representation" : "representations"} on BNB Smart Chain
      </div>
    </div>
  );
}
