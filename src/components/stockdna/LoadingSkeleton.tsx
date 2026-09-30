export function LoadingSkeleton() {
  return (
    <div
      className="animate-pulse"
      style={{
        width: "100%",
        maxWidth: "1140px",
        margin: "0 auto",
        padding: "2rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}
    >
      {/* Underlying Root Skeleton */}
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          height: "120px",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.65rem",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div style={{ width: "35%", height: "14px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-xs)" }} />
        <div style={{ width: "65%", height: "22px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-xs)" }} />
        <div style={{ width: "45%", height: "14px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-xs)" }} />
      </div>

      {/* Cards Skeleton Grid */}
      <div
        style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: "260px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ width: "40%", height: "18px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-xs)" }} />
              <div style={{ width: "25%", height: "18px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-xs)" }} />
            </div>
            <div style={{ width: "70%", height: "24px", backgroundColor: "var(--bg-muted)", borderRadius: "var(--radius-xs)", marginTop: "0.2rem" }} />
            <div style={{ width: "100%", height: "48px", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", marginTop: "0.5rem" }} />
            <div style={{ width: "100%", height: "36px", backgroundColor: "var(--bg-app)", borderRadius: "var(--radius-xs)", marginTop: "auto" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
