/**
 * Source classification hierarchy established in Phase 1.5 Evidence Audit.
 */
export type EvidenceClass =
  | "FIRST_PARTY"
  | "ON_CHAIN"
  | "ORACLE"
  | "THIRD_PARTY"
  | "INFERRED"
  | "UNKNOWN";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

/**
 * Provenance tracking record attached to verified facts and representations.
 */
export interface EvidenceRecord {
  readonly sourceClass: EvidenceClass;
  readonly sourceName: string;
  readonly sourceRef?: string;
  readonly observedAt?: string;
  readonly confidence: ConfidenceLevel;
  readonly notes?: string;
}
