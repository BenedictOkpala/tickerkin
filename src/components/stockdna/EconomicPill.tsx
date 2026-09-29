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
            padding: "0.65rem 0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Auto-DRIP (Scaled UI)
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Total return</span>
          </div>

          <p
            style={{
              fontSize: "0.76rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              marginBottom: "0.35rem",
            }}
          >
            Net dividends automatically reinvest into underlying shares; balance scales on BNB Smart Chain.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.72rem",
            }}
          >
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              Price tracks NAV
            </code>
            {model.currentScaleFactor !== undefined ? (
              <span
                style={{
                  color: "var(--status-active)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  backgroundColor: "var(--status-active-soft)",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--status-active-border)",
                }}
              >
                Scale factor: {model.currentScaleFactor}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                Live factor not available
              </span>
            )}
          </div>
        </div>
      );

    case "multiplier":
      return (
        <div
          style={{
            padding: "0.65rem 0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Multiplier model
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Dynamic balance</span>
          </div>

          <p
            style={{
              fontSize: "0.76rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              marginBottom: "0.35rem",
            }}
          >
            Effective balance is derived from raw balance using the provider&apos;s multiplier mechanism.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.72rem",
            }}
          >
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              Raw × Multiplier = Effective
            </code>
            {model.currentMultiplier !== undefined ? (
              <span
                style={{
                  color: "var(--status-active)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  backgroundColor: "var(--status-active-soft)",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--status-active-border)",
                }}
              >
                Multiplier: {model.currentMultiplier}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                Live factor not available
              </span>
            )}
          </div>
        </div>
      );

    case "redemption_rate":
      return (
        <div
          style={{
            padding: "0.65rem 0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.25rem",
            }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              Redemption-rate model
            </span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Tracker certificate</span>
          </div>

          <p
            style={{
              fontSize: "0.76rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
              marginBottom: "0.35rem",
            }}
          >
            Certificate tracking total return through an evolving redemption rate index.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.72rem",
            }}
          >
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--accent-primary)", fontSize: "0.7rem" }}>
              {model.rateFeedSymbol ?? "Pyth .RR Oracle Feed"}
            </code>
            {model.currentRate !== undefined ? (
              <span
                style={{
                  color: "var(--status-active)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  backgroundColor: "var(--status-active-soft)",
                  padding: "0.1rem 0.35rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--status-active-border)",
                }}
              >
                Rate: {model.currentRate}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                Live factor not available
              </span>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div
          style={{
            padding: "0.65rem 0.75rem",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>
            Standard tracker
          </span>
          <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
            {model.description}
          </p>
        </div>
      );
  }
}
