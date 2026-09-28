import type { EvidenceRecord } from "@/types/provenance";

interface ProvenanceBadgeProps {
  readonly provenance: EvidenceRecord;
  readonly onInspect?: (provenance: EvidenceRecord) => void;
}

export function ProvenanceBadge({ provenance, onInspect }: ProvenanceBadgeProps) {
  const getBadgeLabel = (cls: string) => {
    switch (cls) {
      case "ON_CHAIN":
        return "On-Chain Verified";
      case "ORACLE":
        return "Oracle Feed";
      case "FIRST_PARTY":
        return "First-Party Docs";
      default:
        return cls;
    }
  };

  return (
    <button
      type="button"
      onClick={() => onInspect?.(provenance)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.22rem 0.55rem",
        borderRadius: "var(--radius-xs)",
        backgroundColor: "var(--bg-surface)",
        color: "var(--text-secondary)",
        border: "1px solid var(--border-subtle)",
        fontSize: "0.73rem",
        fontWeight: 500,
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)";
        e.currentTarget.style.color = "var(--text-primary)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)";
        e.currentTarget.style.color = "var(--text-secondary)";
      }}
      title="Click to view verified evidence and audit trail"
    >
      <span style={{ color: "var(--accent-primary)" }}>🛡</span>
      <span>{getBadgeLabel(provenance.sourceClass)}</span>
      <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>→</span>
    </button>
  );
}
