import type {
  TickerLookupResult,
  ContractLookupResult,
} from "@/types/lens";
import type { TokenizedRepresentation, ProviderId } from "@/types/token";
import type { ProviderAdapter, RawProviderAssetRecord } from "@/types/provider";
import { ondoAdapter } from "@/providers/ondo";
import { bstocksAdapter } from "@/providers/bstocks";
import { xstocksAdapter } from "@/providers/xstocks";
import { VERIFIED_REGISTRY, type RegistryEquityEntry } from "./registry";

import { binanceRwaAdapter, BinanceRwaAdapter } from "@/providers/binance";
import { fetchBStocksMultiplierFromRpc, bscMultiplierToEnrichment, type BscMultiplierResult } from "@/providers/bstocks/bsc-rpc";
import { fetchXStocksMultiplierFromRpc, xstocksMultiplierToEnrichment } from "@/providers/xstocks/bsc-rpc";

/**
 * Normalizes an Ethereum / BNB Smart Chain address to standard lowercase format.
 */
export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase();
}

/**
 * Validates whether a string is a well-formed 20-byte hex EVM address (with 0x prefix).
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

/**
 * Central RWA Lens Engine.
 * Provides verified discovery and normalization for tokenized equities on BNB Smart Chain.
 */
export class RWALensEngine {
  private readonly adapters: ReadonlyMap<ProviderId, ProviderAdapter>;
  private readonly registry: readonly RegistryEquityEntry[];
  private readonly enrichmentAdapter: BinanceRwaAdapter;
  private readonly bscRpcFetcher: (contractAddress: string) => Promise<BscMultiplierResult | null>;
  private readonly xstocksRpcFetcher: (contractAddress: string) => Promise<BscMultiplierResult | null>;

  constructor(
    registry: readonly RegistryEquityEntry[] = VERIFIED_REGISTRY,
    enrichmentAdapter: BinanceRwaAdapter = binanceRwaAdapter,
    bscRpcFetcher: (contractAddress: string) => Promise<BscMultiplierResult | null> = fetchBStocksMultiplierFromRpc,
    xstocksRpcFetcher: (contractAddress: string) => Promise<BscMultiplierResult | null> = fetchXStocksMultiplierFromRpc
  ) {
    this.registry = registry;
    this.enrichmentAdapter = enrichmentAdapter;
    this.bscRpcFetcher = bscRpcFetcher;
    this.xstocksRpcFetcher = xstocksRpcFetcher;
    this.adapters = new Map<ProviderId, ProviderAdapter>([
      ["ondo", ondoAdapter],
      ["bstocks", bstocksAdapter],
      ["xstocks", xstocksAdapter],
    ]);
  }

  /**
   * Normalizes a raw provider asset record using its designated provider adapter.
   */
  public normalizeRepresentation(
    providerId: ProviderId,
    record: RawProviderAssetRecord
  ): TokenizedRepresentation {
    const adapter = this.adapters.get(providerId);
    if (!adapter) {
      throw new Error(`Unrecognized provider adapter: ${providerId}`);
    }
    return adapter.normalize(record);
  }

  /**
   * Looks up an equity by traditional ticker (e.g. "NVDA", "AAPL", "TSLA").
   * Lookup is case-insensitive and synchronous (un-enriched baseline).
   */
  public lookupByTicker(ticker: string): TickerLookupResult {
    const cleanTicker = ticker.trim().toUpperCase();
    if (!cleanTicker) {
      return {
        success: false,
        query: ticker,
        error: "TICKER_NOT_FOUND",
        message: "A non-empty ticker symbol must be provided.",
      };
    }

    const entry = this.registry.find(
      (e) => e.equity.ticker.toUpperCase() === cleanTicker
    );

    if (!entry) {
      return {
        success: false,
        query: ticker,
        error: "TICKER_NOT_FOUND",
        message: `No verified tokenized representations found for ticker '${cleanTicker}' on BNB Smart Chain.`,
      };
    }

    const representations = entry.providerRecords.map(({ providerId, record }) =>
      this.normalizeRepresentation(providerId, record)
    );

    return {
      success: true,
      query: ticker,
      underlying: entry.equity,
      representations,
    };
  }

  /**
   * Looks up an equity by traditional ticker with live dynamic enrichment.
   * Priority:
   * 1. Direct on-chain BSC RPC eth_call for bStocks multiplier
   * 2. Direct on-chain BSC RPC eth_call for xStocks multiplier
   * 3. Binance Web3 RWA API for other providers (e.g. Ondo)
   * Falls back gracefully to baseline verified representations if external sources are unavailable.
   */
  public async lookupByTickerAsync(ticker: string): Promise<TickerLookupResult> {
    const baseline = this.lookupByTicker(ticker);
    if (!baseline.success) {
      return baseline;
    }

    let representations = baseline.representations;

    // 1. Attempt Binance RWA Web3 enrichment (e.g. for Ondo)
    try {
      representations = await this.enrichmentAdapter.enrichRepresentationsAsync(
        representations,
        baseline.underlying.ticker
      );
    } catch {
      // Continue with baseline if Binance fails
    }

    // 2. Direct on-chain BSC RPC enrichment for bStocks and xStocks (Primary verified on-chain sources)
    const enrichedWithOnChain = await Promise.all(
      representations.map(async (rep) => {
        if (rep.providerId === "bstocks") {
          try {
            const bscResult = await this.bscRpcFetcher(rep.contractAddress);
            if (bscResult) {
              return {
                ...rep,
                liveEnrichment: bscMultiplierToEnrichment(bscResult, rep.contractAddress),
              };
            }
          } catch {
            // Keep existing representation if BSC RPC fails
          }
        } else if (rep.providerId === "xstocks") {
          try {
            const xstocksResult = await this.xstocksRpcFetcher(rep.contractAddress);
            if (xstocksResult) {
              return {
                ...rep,
                liveEnrichment: xstocksMultiplierToEnrichment(xstocksResult, rep.contractAddress),
              };
            }
          } catch {
            // Keep existing representation if BSC RPC fails
          }
        }
        return rep;
      })
    );

    return {
      ...baseline,
      representations: enrichedWithOnChain,
    };
  }

  /**
   * Looks up an equity and its representation by BNB Smart Chain contract address.
   * Lookup is case-insensitive and synchronous (un-enriched baseline).
   */
  public lookupByContract(contractAddress: string): ContractLookupResult {
    const rawAddress = contractAddress.trim();
    if (!isValidEvmAddress(rawAddress)) {
      return {
        success: false,
        query: contractAddress,
        error: "INVALID_ADDRESS",
        message: `Invalid EVM contract address format: '${contractAddress}'. Expected 40 hex characters with 0x prefix.`,
      };
    }

    const targetAddress = normalizeAddress(rawAddress);

    for (const entry of this.registry) {
      for (const { providerId, record } of entry.providerRecords) {
        if (normalizeAddress(record.contractAddress) === targetAddress) {
          const normalizedRep = this.normalizeRepresentation(providerId, record);
          return {
            success: true,
            query: contractAddress,
            normalizedAddress: targetAddress,
            matchedRepresentation: normalizedRep,
            underlying: entry.equity,
          };
        }
      }
    }

    return {
      success: false,
      query: contractAddress,
      normalizedAddress: targetAddress,
      error: "CONTRACT_NOT_FOUND",
      message: `Contract '${targetAddress}' is not registered as a verified tokenized equity on BNB Smart Chain.`,
    };
  }

  /**
   * Looks up an equity by contract address with live dynamic enrichment.
   * Priority:
   * 1. Direct on-chain BSC RPC eth_call for bStocks & xStocks multipliers
   * 2. Binance Web3 RWA API for other providers
   */
  public async lookupByContractAsync(contractAddress: string): Promise<ContractLookupResult> {
    const baseline = this.lookupByContract(contractAddress);
    if (!baseline.success) {
      return baseline;
    }

    let matchedRep = baseline.matchedRepresentation;

    // 1. Attempt Binance enrichment
    try {
      matchedRep = await this.enrichmentAdapter.enrichSingleRepresentationAsync(
        matchedRep,
        baseline.underlying.ticker
      );
    } catch {
      // Continue
    }

    // 2. Direct on-chain BSC RPC enrichment for bStocks and xStocks
    if (matchedRep.providerId === "bstocks") {
      try {
        const bscResult = await this.bscRpcFetcher(matchedRep.contractAddress);
        if (bscResult) {
          matchedRep = {
            ...matchedRep,
            liveEnrichment: bscMultiplierToEnrichment(bscResult, matchedRep.contractAddress),
          };
        }
      } catch {
        // Keep existing
      }
    } else if (matchedRep.providerId === "xstocks") {
      try {
        const xstocksResult = await this.xstocksRpcFetcher(matchedRep.contractAddress);
        if (xstocksResult) {
          matchedRep = {
            ...matchedRep,
            liveEnrichment: xstocksMultiplierToEnrichment(xstocksResult, matchedRep.contractAddress),
          };
        }
      } catch {
        // Keep existing
      }
    }

    return {
      ...baseline,
      matchedRepresentation: matchedRep,
    };
  }

  /**
   * Returns list of supported traditional tickers in the verified registry.
   */
  public getSupportedTickers(): string[] {
    return this.registry.map((e) => e.equity.ticker);
  }

  /**
   * Returns list of all verified contract addresses across all providers.
   */
  public getSupportedContracts(): string[] {
    const contracts: string[] = [];
    for (const entry of this.registry) {
      for (const { record } of entry.providerRecords) {
        contracts.push(normalizeAddress(record.contractAddress));
      }
    }
    return contracts;
  }

  /**
   * Returns factual catalog of verified equities.
   */
  public getEquitiesCatalog(): import("@/types/lens").EquityCatalogItem[] {
    return this.registry.map((entry) => ({
      ticker: entry.equity.ticker,
      name: entry.equity.name,
      exchange: entry.equity.exchange,
      quoteCurrency: entry.equity.quoteCurrency,
      representationCount: entry.providerRecords.length,
      providerIds: entry.providerRecords.map((p) => p.providerId),
      chain: "BNB Smart Chain",
    }));
  }

  /**
   * Returns factual catalog of supported providers and their verified representations in RWA Lens.
   */
  public getProvidersCatalog(): import("@/types/lens").ProviderCatalogItem[] {
    const providersMap: Record<string, {
      id: string;
      name: string;
      issuer: string;
      mechanism: string;
      dex?: string;
      sourceRef?: string;
      tickers: Set<string>;
    }> = {
      ondo: {
        id: "ondo",
        name: "Ondo Finance",
        issuer: "Ondo Global Markets",
        mechanism: "Auto-DRIP (Scaled UI)",
        dex: "PancakeSwap",
        sourceRef: "https://docs.ondo.finance",
        tickers: new Set(),
      },
      bstocks: {
        id: "bstocks",
        name: "Binance bStocks",
        issuer: "BTech Holdings Limited",
        mechanism: "Multiplier Model",
        dex: "PancakeSwap",
        sourceRef: "https://www.binance.com",
        tickers: new Set(),
      },
      xstocks: {
        id: "xstocks",
        name: "xStocks (Backed Finance)",
        issuer: "Backed Assets (JE) Limited",
        mechanism: "Redemption-Rate Model",
        dex: "Multi-chain (Solana DEXes / PancakeSwap)",
        sourceRef: "https://docs.backed.fi",
        tickers: new Set(),
      },
    };

    for (const entry of this.registry) {
      for (const { providerId } of entry.providerRecords) {
        if (providersMap[providerId]) {
          providersMap[providerId].tickers.add(entry.equity.ticker);
        }
      }
    }

    return Object.values(providersMap).map((p) => ({
      id: p.id,
      name: p.name,
      issuer: p.issuer,
      verifiedRepresentationCount: p.tickers.size,
      supportedTickers: Array.from(p.tickers),
      economicMechanism: p.mechanism,
      secondaryDex: p.dex,
      sourceRef: p.sourceRef,
    }));
  }
}

/**
 * Singleton instance of the RWA Lens engine.
 */
export const rwaLens = new RWALensEngine();

/**
 * Convenience helper for synchronous ticker lookup.
 */
export function lookupByTicker(ticker: string): TickerLookupResult {
  return rwaLens.lookupByTicker(ticker);
}

/**
 * Convenience helper for async enriched ticker lookup.
 */
export function lookupByTickerAsync(ticker: string): Promise<TickerLookupResult> {
  return rwaLens.lookupByTickerAsync(ticker);
}

/**
 * Convenience helper for synchronous contract lookup.
 */
export function lookupByContract(contractAddress: string): ContractLookupResult {
  return rwaLens.lookupByContract(contractAddress);
}

/**
 * Convenience helper for async enriched contract lookup.
 */
export function lookupByContractAsync(contractAddress: string): Promise<ContractLookupResult> {
  return rwaLens.lookupByContractAsync(contractAddress);
}

/**
 * Convenience helper for equities catalog.
 */
export function getEquitiesCatalog(): import("@/types/lens").EquityCatalogItem[] {
  return rwaLens.getEquitiesCatalog();
}

/**
 * Convenience helper for providers catalog.
 */
export function getProvidersCatalog(): import("@/types/lens").ProviderCatalogItem[] {
  return rwaLens.getProvidersCatalog();
}
