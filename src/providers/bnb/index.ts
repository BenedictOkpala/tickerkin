import type { EvidenceRecord } from "@/types/provenance";
import type { TraditionalMarketHours } from "@/types/equity";

/**
 * Pyth & BNB Chain Ecosystem Oracle Adapter.
 * Normalizes traditional market status and equity benchmark feeds.
 */
export class BnbOracleAdapter {
  readonly id = "bnb-oracle" as const;
  readonly name = "BNB Ecosystem / Pyth Network Oracles";
  readonly chain = "BNB Smart Chain" as const;
  readonly oracleContractAddress = "0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594";

  getProvenance(): EvidenceRecord {
    return {
      sourceClass: "ORACLE",
      sourceName: "Pyth Network Hermes API & BSC Pyth Contract",
      sourceRef: "https://docs.pyth.network/price-feeds/api-reference/hermes-api",
      confidence: "HIGH",
      notes: "Verified live NASDAQ equity schedule and 24/7 tokenized feed identifiers on BSC",
    };
  }

  formatMarketHours(params: {
    isOpen: boolean;
    nextOpen?: number;
    nextClose?: number;
    schedule?: string;
  }): TraditionalMarketHours {
    return {
      isOpen: params.isOpen,
      nextOpen: params.nextOpen,
      nextClose: params.nextClose,
      schedule: params.schedule ?? "America/New_York;0930-1600,0930-1600,0930-1600,0930-1600,0930-1600,C,C",
      timezone: "America/New_York",
    };
  }
}

export const bnbOracleAdapter = new BnbOracleAdapter();
