import type { StockDnaError } from "@/hooks/useStockDna";

interface ErrorBannerProps {
  readonly error: StockDnaError;
  readonly onReset: () => void;
}

export function ErrorBanner({ error, onReset }: ErrorBannerProps) {
  const isAddressError = error.code === "INVALID_ADDRESS" || error.code === "CONTRACT_NOT_FOUND";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--accent-red)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 4px 20px rgba(239, 68, 68, 0.1)",
        textAlign: "center",
      }}
      className="animate-fade-in"
    >
      <div style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
        {isAddressError ? "🔍" : "⚠️"}
      </div>

      <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.4rem" }}>
        {error.code === "TICKER_NOT_FOUND" && "Ticker Not Yet Verified"}
        {error.code === "CONTRACT_NOT_FOUND" && "Contract Not In Verified Registry"}
        {error.code === "INVALID_ADDRESS" && "Invalid Contract Address Format"}
        {error.code !== "TICKER_NOT_FOUND" &&
          error.code !== "CONTRACT_NOT_FOUND" &&
          error.code !== "INVALID_ADDRESS" &&
          "Resolution Error"}
      </h3>

      <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
        {error.message}
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: "0.45rem 1rem",
            borderRadius: "var(--radius-md)",
            backgroundColor: "var(--accent-gold)",
            color: "#000",
            fontWeight: 600,
            fontSize: "0.85rem",
          }}
        >
          View Flagship NVDA
        </button>
      </div>
    </div>
  );
}
