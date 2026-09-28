import type { TickerKinError } from "@/hooks/useStockDna";

interface ErrorBannerProps {
  readonly error: TickerKinError;
  readonly onReset: () => void;
}

export function ErrorBanner({ error, onReset }: ErrorBannerProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "540px",
        margin: "2.5rem auto",
        padding: "1.5rem",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        textAlign: "center",
      }}
      className="animate-fade-in"
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          backgroundColor: "var(--status-error-soft)",
          border: "1px solid var(--status-error-border)",
          color: "var(--status-error)",
          fontSize: "1.1rem",
          marginBottom: "0.75rem",
        }}
      >
        !
      </div>

      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.35rem" }}>
        {error.code === "TICKER_NOT_FOUND" && "Ticker Not In Verified Registry"}
        {error.code === "CONTRACT_NOT_FOUND" && "Contract Not In Verified Registry"}
        {error.code === "INVALID_ADDRESS" && "Invalid Contract Address Format"}
        {error.code !== "TICKER_NOT_FOUND" &&
          error.code !== "CONTRACT_NOT_FOUND" &&
          error.code !== "INVALID_ADDRESS" &&
          "Resolution Error"}
      </h3>

      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
        {error.message}
      </p>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: "0.38rem 0.9rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--bg-surface)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-subtle)",
            fontWeight: 600,
            fontSize: "0.8rem",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-subtle)";
          }}
        >
          Reset to Flagship NVDA
        </button>
      </div>
    </div>
  );
}
