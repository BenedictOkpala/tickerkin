import type { EvidenceRecord } from "./provenance";

export type PriceType =
  | "TRADITIONAL_EQUITY_REFERENCE"
  | "TOKEN_NAV"
  | "DEX_MARKET_PRICE";

export interface PricePoint {
  readonly value: number | null;
  readonly currency: string;
  readonly priceType: PriceType;
  readonly timestamp?: string;
  readonly source: string;
  readonly provenance: EvidenceRecord;
}

export interface RepresentationPriceInfo {
  readonly referencePrice?: PricePoint;
  readonly tokenNavPrice?: PricePoint;
  readonly dexPoolPrice?: PricePoint;
}
