import type { EvidenceRecord } from "@/types/provenance";

interface ProvenanceBadgeProps {
  readonly provenance: EvidenceRecord;
  readonly onInspect?: (provenance: EvidenceRecord) => void;
}

export function ProvenanceBadge({ provenance, onInspect }: ProvenanceBadgeProps) {
  const getBadgeStyle = (cls: string) => {
    switch (cls) {
      case "ON_CHAIN":
        return {
          bg: "var(--accent-cyan-soft)",
          color: "var(--accent-cyan)",
          border: "var(--accent-cyan-border)",
          icon: "⛓️",
          label: "On-Chain Verified",
        };
      case "ORACLE":
        return {
          bg: "var(--accent-gold-soft)",
          color: "var(--accent-gold)",
          border: "var(--accent-gold-border)",
          icon: "⚡",
          label: "Oracle Feed",
        };
      case "FIRST_PARTY":
        return {
          bg: "var(--accent-green-soft)",
          color: "var(--accent-green)",
          border: "rgba(16, 185, 129, 0.3)",
          icon: "🏛️",
          label: "First-Party Doc",
        };
      default:
        return {
          bg: "var(--bg-surface)",
          color: "var(--text-secondary)",
          border: "var(--border-subtle)",
          icon: "ℹ️",
          label: cls,
        };
    }
  };

  const style = getBadgeStyle(provenance.sourceClass);

  return (
    <button
      type="button"
      onClick={() => onInspect?.(provenance)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        padding: "0.2rem 0.5rem",
        borderRadius: "var(--radius-sm)",
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontSize: "0.75rem",
        fontWeight: 600,
        transition: "opacity 0.15s",
      }}
      title="Click to inspect verification evidence"
    >
      <span>{style.icon}</span>
      <span>{style.label}</span>
      <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>›</span>
    </button>
  );
}
