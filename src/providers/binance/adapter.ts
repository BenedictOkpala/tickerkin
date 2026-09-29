import type { TokenizedRepresentation } from "@/types/token";
import type { EconomicModel } from "@/types/economic";
import type { EvidenceRecord } from "@/types/provenance";
import type {
  BinanceRawStockRecord,
  BinanceLiveEnrichment,
  IdentityMatchResult,
} from "@/types/binance";
import { BinanceRwaClient, defaultBinanceClient } from "./client";
import { findMatchingBinanceRecord } from "./matcher";

export interface BinanceAdapterOptions {
  readonly client?: BinanceRwaClient;
}

/**
 * BinanceRwaAdapter:
 * External read-only adapter that enriches verified RWA representations with
 * dynamic data from the public Binance Web3 RWA API.
 *
 * NOTE: Binance is an external data provider/indexer, NOT the issuer of any tokenized asset.
 */
export class BinanceRwaAdapter {
  private readonly client: BinanceRwaClient;

  constructor(options: BinanceAdapterOptions = {}) {
    this.client = options.client ?? defaultBinanceClient;
  }

  /**
   * Generates provenance record for Binance-derived live data.
   */
  public createProvenance(matchResult: IdentityMatchResult): EvidenceRecord {
    return {
      sourceClass: "THIRD_PARTY",
      sourceName: "Binance Web3 RWA Data",
      sourceRef: this.client.getBaseUrl(),
      confidence: matchResult.confidence === "HIGH" ? "HIGH" : "MEDIUM",
      observedAt: new Date().toISOString(),
      notes: `Enriched via Binance Web3 RWA Data public indexer. Identity match: ${matchResult.matchBasis}`,
    };
  }

  /**
   * Transforms a validated raw record into a BinanceLiveEnrichment object.
   */
  public toLiveEnrichment(
    record: BinanceRawStockRecord,
    matchResult: IdentityMatchResult
  ): BinanceLiveEnrichment {
    const numMultiplier = Number.parseFloat(record.multiplier);
    const lastUpdateIso = record.lastUpdateTime
      ? new Date(record.lastUpdateTime).toISOString()
      : undefined;

    return {
      rawMultiplier: record.multiplier,
      multiplierValue: numMultiplier,
      lastUpdateTime: record.lastUpdateTime,
      lastUpdateIso,
      decimals: record.d,
      tradingPair: record.cs,
      assetType: record.assetType,
      matchConfidence: matchResult.confidence,
      matchBasis: matchResult.matchBasis,
      provenance: this.createProvenance(matchResult),
    };
  }

  /**
   * Enriches the provider's specific economic model with the verified live multiplier/rate.
   * Maintains distinct economic mechanism semantics without flattening.
   */
  public enrichEconomicModel(
    model: EconomicModel,
    enrichment: BinanceLiveEnrichment
  ): EconomicModel {
    switch (model.mechanism) {
      case "auto_drip_scaled":
        return {
          ...model,
          currentScaleFactor: enrichment.multiplierValue,
        };

      case "multiplier":
        return {
          ...model,
          currentMultiplier: enrichment.multiplierValue,
        };

      case "redemption_rate":
        return {
          ...model,
          currentRate: enrichment.multiplierValue,
        };

      default:
        return model;
    }
  }

  /**
   * Matches candidate Binance records against a tokenized representation and enriches it
   * if and only if high-confidence identity is verified.
   */
  public enrichRepresentation(
    representation: TokenizedRepresentation,
    underlyingTicker: string,
    candidateRecords: readonly BinanceRawStockRecord[]
  ): TokenizedRepresentation {
    const match = findMatchingBinanceRecord(representation, underlyingTicker, candidateRecords);

    if (!match.matched || !match.record) {
      return representation;
    }

    const enrichment = this.toLiveEnrichment(match.record, match);
    const enrichedEconomicModel = this.enrichEconomicModel(
      representation.economicModel,
      enrichment
    );

    return {
      ...representation,
      economicModel: enrichedEconomicModel,
      liveEnrichment: enrichment,
    };
  }

  /**
   * Fetches live records from Binance and enriches an array of representations.
   */
  public async enrichRepresentationsAsync(
    representations: readonly TokenizedRepresentation[],
    underlyingTicker: string
  ): Promise<readonly TokenizedRepresentation[]> {
    try {
      const records = await this.client.fetchAllStocks();
      if (!records || records.length === 0) {
        return representations;
      }

      return representations.map((rep) =>
        this.enrichRepresentation(rep, underlyingTicker, records)
      );
    } catch {
      // Graceful fallback to unaltered representations if network fails
      return representations;
    }
  }

  /**
   * Fetches live records and enriches a single matched representation.
   */
  public async enrichSingleRepresentationAsync(
    representation: TokenizedRepresentation,
    underlyingTicker: string
  ): Promise<TokenizedRepresentation> {
    try {
      const records = await this.client.fetchAllStocks();
      if (!records || records.length === 0) {
        return representation;
      }

      return this.enrichRepresentation(representation, underlyingTicker, records);
    } catch {
      return representation;
    }
  }
}

export const binanceRwaAdapter = new BinanceRwaAdapter();
