import type { EvidenceRecord } from "./provenance";

/**
 * Raw record format returned by Binance Web3 RWA Data API:
 * GET /bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai?type={1|2|3}
 */
export interface BinanceRawStockRecord {
  readonly chainId: string;
  readonly contractAddress: string;
  readonly symbol: string;
  readonly ticker: string;
  readonly type: number;
  readonly assetType?: number;
  readonly multiplier: string;
  readonly lastUpdateTime?: number;
  readonly d?: number;
  readonly cs?: string;
  readonly asset?: string;
}

/**
 * Raw envelope response structure from Binance Web3 API.
 */
export interface BinanceRawResponseEnvelope {
  readonly code: string;
  readonly message: string | null;
  readonly messageDetail: string | null;
  readonly data: BinanceRawStockRecord[] | null;
}

/**
 * Match confidence and criteria for identity resolution.
 */
export type MatchConfidence = "HIGH" | "MEDIUM" | "NO_MATCH";

export interface IdentityMatchResult {
  readonly matched: boolean;
  readonly confidence: MatchConfidence;
  readonly matchBasis: string;
  readonly record?: BinanceRawStockRecord;
}

/**
 * Normalized live enrichment model attached to a token representation.
 */
export interface BinanceLiveEnrichment {
  readonly rawMultiplier: string;
  readonly multiplierValue: number;
  readonly lastUpdateTime?: number;
  readonly lastUpdateIso?: string;
  readonly decimals?: number;
  readonly tradingPair?: string;
  readonly assetType?: number;
  readonly matchConfidence: MatchConfidence;
  readonly matchBasis: string;
  readonly provenance: EvidenceRecord;
}
