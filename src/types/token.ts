import type { EconomicModel } from "./economic";
import type { RepresentationPriceInfo } from "./price";
import type { EvidenceRecord } from "./provenance";

export type ProviderId = "ondo" | "bstocks" | "xstocks";

export type TokenStatus = "ACTIVE" | "PHASING_OUT" | "UNVERIFIED" | "UNKNOWN";

export type LiquidityStatus = "HIGH" | "MODERATE" | "LOW" | "UNKNOWN";

export interface TokenMarketInfo {
  readonly onChainTradingAvailable: boolean;
  readonly secondaryLiquidityStatus: LiquidityStatus;
  readonly primaryDEX?: string;
  readonly notes?: string;
}

export interface TokenizedRepresentation {
  readonly providerId: ProviderId;
  readonly providerName: string;
  readonly issuer: string;
  readonly tokenSymbol: string;
  readonly tokenName: string;
  readonly chain: "BNB Smart Chain";
  readonly chainId: 56;
  readonly contractAddress: string;
  readonly decimals: number;
  readonly tokenStandard: "BEP-20";
  readonly status: TokenStatus;
  readonly economicModel: EconomicModel;
  readonly priceInfo?: RepresentationPriceInfo;
  readonly marketInfo?: TokenMarketInfo;
  readonly provenance: EvidenceRecord;
}
