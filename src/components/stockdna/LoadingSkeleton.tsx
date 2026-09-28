export function LoadingSkeleton() {
  return (
    <div
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
          width: "360px",
          height: "110px",
          backgroundColor: "var(--bg-card)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border-subtle)",
          opacity: 0.5,
        }}
      />

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
              height: "240px",
              backgroundColor: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-subtle)",
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}
