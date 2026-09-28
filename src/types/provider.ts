import type { TokenizedRepresentation, ProviderId } from "./token";

/**
 * Raw data structure stored in verified registry or returned by provider feeds.
 */
export interface RawProviderAssetRecord {
  readonly ticker: string;
  readonly tokenSymbol: string;
  readonly tokenName: string;
  readonly contractAddress: string;
  readonly decimals: number;
  readonly status: "ACTIVE" | "PHASING_OUT" | "UNVERIFIED";
  readonly economicParams?: Record<string, unknown>;
  readonly secondaryDex?: string;
  readonly liquidityTier?: "HIGH" | "MODERATE" | "LOW" | "UNKNOWN";
  readonly sourceRef?: string;
}

/**
 * Interface that every provider adapter must implement.
 */
export interface ProviderAdapter {
  readonly id: ProviderId;
  readonly name: string;
  readonly issuer: string;
  readonly chain: "BNB Smart Chain";

  /**
   * Normalizes a verified raw provider record into the canonical RWA Lens TokenizedRepresentation.
   */
  normalize(record: RawProviderAssetRecord): TokenizedRepresentation;
}

/**
 * Base provider descriptor for metadata queries.
 */
export interface RWAProvider {
  readonly id: string;
  readonly name: string;
  readonly chain: string;
}
