import type { EconomicModel } from "@/types/economic";

interface EconomicPillProps {
  readonly model: EconomicModel;
}

export function EconomicPill({ model }: EconomicPillProps) {
  switch (model.mechanism) {
    case "auto_drip_scaled":
      return (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              Auto-DRIP (Scaled UI)
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total Return</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
            Net dividends automatically reinvest into underlying shares; balance scales on BSC.
          </p>
          <div style={{ fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            Model: Token Price Tracks NAV
          </div>
        </div>
      );

    case "multiplier":
      return (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-gold)", textTransform: "uppercase" }}>
              BEP-677 Multiplier
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Dynamic Factor</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
            Adjusts effective share units for stock splits and net dividend reinvestment.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              Raw × Multiplier = Effective
            </code>
            <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontStyle: "italic" }}>
              Live factor: Polled on-chain
            </span>
          </div>
        </div>
      );

    case "redemption_rate":
      return (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent-cyan)", textTransform: "uppercase" }}>
              Redemption Rate Tracker
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Tracker Certificate</span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
            Certificate tracking total return through an evolving redemption rate index.
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)", fontSize: "0.7rem" }}>
              {model.rateFeedSymbol ?? "Pyth .RR Oracle Feed"}
            </code>
            <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontStyle: "italic" }}>
              Live rate: Polled via Oracle
            </span>
          </div>
        </div>
      );

    default:
      return (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            Standard Tracker
          </span>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
            {model.description}
          </p>
        </div>
      );
  }
}
