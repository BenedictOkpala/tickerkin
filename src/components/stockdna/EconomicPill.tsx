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
            padding: "0.85rem 1rem",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Auto-DRIP (Scaled UI)
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-surface)",
                padding: "0.1rem 0.4rem",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Total Return
            </span>
          </div>

          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
            }}
          >
            Net dividends automatically reinvest into underlying shares; balance scales on BNB Smart Chain.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              paddingTop: "0.25rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "0.74rem" }}>
              Price tracks NAV
            </code>
            {model.currentScaleFactor !== undefined ? (
              <span
                style={{
                  color: "var(--accent-primary)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  backgroundColor: "var(--accent-primary-soft)",
                  padding: "0.12rem 0.45rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--accent-primary-border)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Scale: {model.currentScaleFactor}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
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
            padding: "0.85rem 1rem",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Multiplier Model
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-surface)",
                padding: "0.1rem 0.4rem",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Dynamic Balance
            </span>
          </div>

          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
            }}
          >
            Effective balance is calculated as: <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.74rem", color: "var(--text-primary)" }}>Raw Units × Multiplier</code>.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              paddingTop: "0.25rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "0.74rem" }}>
              Raw × Multiplier = Effective
            </code>
            {model.currentMultiplier !== undefined ? (
              <span
                style={{
                  color: "var(--accent-primary)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  backgroundColor: "var(--accent-primary-soft)",
                  padding: "0.12rem 0.45rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--accent-primary-border)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Multiplier: {model.currentMultiplier}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
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
            padding: "0.85rem 1rem",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
            display: "flex",
            flexDirection: "column",
            gap: "0.45rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Redemption-Rate Model
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-surface)",
                padding: "0.1rem 0.4rem",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              Tracker Certificate
            </span>
          </div>

          <p
            style={{
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              lineHeight: 1.45,
            }}
          >
            Certificate tracking total equity return through an evolving redemption rate index.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.75rem",
              paddingTop: "0.25rem",
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)", fontSize: "0.74rem" }}>
              {model.rateFeedSymbol ?? "Pyth .RR Oracle Feed"}
            </code>
            {model.currentRate !== undefined ? (
              <span
                style={{
                  color: "var(--accent-primary)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  backgroundColor: "var(--accent-primary-soft)",
                  padding: "0.12rem 0.45rem",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--accent-primary-border)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                Rate: {model.currentRate}
              </span>
            ) : (
              <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
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
            padding: "0.85rem 1rem",
            backgroundColor: "var(--bg-app)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-secondary)" }}>
            Standard Tracker
          </span>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {model.description}
          </p>
        </div>
      );
  }
}
