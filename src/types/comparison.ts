import type { ProviderId } from "./token";
import type { EvidenceRecord } from "./provenance";
import type { ClaimScopedEvidence } from "@/lens/presentation";

export type NormalizationStatus = "AVAILABLE" | "UNAVAILABLE";

export type ReferencePriceStatus =
  | "LIVE"
  | "REFERENCE"
  | "MARKET_CLOSED"
  | "STALE"
  | "UNAVAILABLE";

export type DataFreshnessStatus = "LIVE" | "CACHED" | "STALE" | "UNAVAILABLE";

export type DexLiquidityTier = "HIGH" | "MODERATE" | "LOW" | "UNAVAILABLE";

export type FactorLabel =
  | "Scale Factor"
  | "Multiplier"
  | "Redemption Rate"
  | "Accounting Factor"
  | "Unavailable";

/**
 * Normalized comparison record for a single tokenized representation on BSC.
 */
export interface NormalizedRepresentationComparison {
  readonly providerId: ProviderId;
  readonly providerName: string;
  readonly issuer: string;
  readonly tokenSymbol: string;
  readonly tokenName: string;
  readonly contractAddress: string;
  readonly chain: "BNB Smart Chain";
  readonly chainId: 56;
  readonly decimals: number;
  readonly economicMechanism: string;
  readonly economicMechanismKey: string;
  readonly normalizationStatus: NormalizationStatus;
  readonly accountingFactor: number | null;
  readonly factorLabel: FactorLabel;
  readonly factorSource?: string;
  readonly shareEquivalentPerToken: number | null;
  readonly referenceValuePerTokenUSD: number | null;
  readonly dexMarketPriceUSD: number | null;
  readonly dexLiquidityUSD: number | null;
  readonly dexLiquidityTier: DexLiquidityTier;
  readonly dexPoolAddress: string | null;
  readonly dexPoolName: string | null;
  readonly referenceDeviationPercent: number | null;
  readonly dataTimestamp?: string;
  readonly dataFreshness: DataFreshnessStatus;
  readonly unavailabilityReason?: string;
  readonly provenance: EvidenceRecord;
  readonly claims: readonly ClaimScopedEvidence[];
}

/**
 * Underlying traditional equity reference benchmark.
 */
export interface UnderlyingEquityReference {
  readonly ticker: string;
  readonly name: string;
  readonly exchange: string;
  readonly quoteCurrency: string;
  readonly referencePriceUSD: number | null;
  readonly referencePriceType: "TRADITIONAL_EQUITY_REFERENCE";
  readonly referenceSource: string;
  readonly referenceFeedId: string;
  readonly marketStatus: ReferencePriceStatus;
  readonly marketSchedule: string;
  readonly timestamp?: string;
  readonly provenance: EvidenceRecord;
}

/**
 * Complete normalized comparison matrix for an equity and its representations.
 */
export interface EquityComparisonMatrix {
  readonly underlying: UnderlyingEquityReference;
  readonly representations: readonly NormalizedRepresentationComparison[];
  readonly generatedAt: string;
}

/**
 * Calculator input parameters.
 */
export interface TokenCalculationInput {
  readonly ticker: string;
  readonly providerId: ProviderId;
  readonly tokenAmount: number;
}

/**
 * Calculator computation result.
 */
export interface TokenCalculationOutput {
  readonly ticker: string;
  readonly providerId: ProviderId;
  readonly tokenSymbol: string;
  readonly tokenName: string;
  readonly rawTokenAmount: number;
  readonly normalizationStatus: NormalizationStatus;
  readonly economicMechanism: string;
  readonly accountingFactor: number | null;
  readonly factorLabel: string;
  readonly shareEquivalentAmount: number | null;
  readonly underlyingReferencePriceUSD: number | null;
  readonly totalReferenceValueUSD: number | null;
  readonly mechanismAccretionUSD: number | null;
  readonly source: string;
  readonly freshness: DataFreshnessStatus;
  readonly unavailabilityReason?: string;
  readonly isValid: boolean;
  readonly validationError?: string;
  readonly provenance: EvidenceRecord;
}
