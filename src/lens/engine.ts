import { AuthenticatedBinanceEnrichmentAdapter } from "@/providers/binance/authenticated-adapter";
import type {
  TickerLookupResult,
  ContractLookupResult,
} from "@/types/lens";
import type { EconomicModel } from "@/types/economic";
import { VERIFIED_REGISTRY, type RegistryEquityEntry } from "./registry";

import { binanceRwaAdapter, type BinanceRwaAdapter } from "@/providers/binance";
import { fetchBStocksMultiplierFromRpc, bscMultiplierToEnrichment, type BscMultiplierResult } from "@/providers/bstocks/bsc-rpc";
import { fetchXStocksMultiplierFromRpc, xstocksMultiplierToEnrichment } from "@/providers/xstocks/bsc-rpc";

import { RWALensEngine as BaselineEngine } from "./baseline";
export { normalizeAddress, isValidEvmAddress } from "./baseline";

/** Server orchestration; browser consumers use baseline.ts and internal API routes. */
export class RWALensEngine extends BaselineEngine {
  constructor(registry: readonly RegistryEquityEntry[] = VERIFIED_REGISTRY,
    private readonly enrichmentAdapter: Pick<BinanceRwaAdapter, "enrichRepresentationsAsync" | "enrichSingleRepresentationAsync"> = new AuthenticatedBinanceEnrichmentAdapter(binanceRwaAdapter),
 private readonly bscRpcFetcher: (address: string) => Promise<BscMultiplierResult | null> = fetchBStocksMultiplierFromRpc,
 private readonly xstocksRpcFetcher: (address: string) => Promise<BscMultiplierResult | null> = fetchXStocksMultiplierFromRpc
  ) { super(registry); }
  public async lookupByTickerAsync(ticker: string): Promise<TickerLookupResult> {
    const baseline = this.lookupByTicker(ticker);
    if (!baseline.success) {
      return baseline;
    }

    // 1. Direct on-chain BSC RPC enrichment for bStocks and xStocks (Primary verified on-chain sources)
    // 2. Binance RWA Web3 enrichment (Secondary indexer for third-party metadata / Ondo)
    // Execute concurrently so third-party indexer network latency never delays on-chain reads.
    const [binanceRepsResult, onChainEnriched] = await Promise.all([
      this.enrichmentAdapter
        .enrichRepresentationsAsync(baseline.representations, baseline.underlying.ticker)
        .catch(() => baseline.representations),

      Promise.all(
        baseline.representations.map(async (rep) => {
          if (rep.providerId === "bstocks") {
            try {
              const bscResult = await this.bscRpcFetcher(rep.contractAddress);
              if (bscResult) {
                const liveEnrichment = bscMultiplierToEnrichment(bscResult, rep.contractAddress);
                const updatedModel: EconomicModel =
                  rep.economicModel.mechanism === "multiplier"
                    ? { ...rep.economicModel, currentMultiplier: bscResult.multiplierValue }
                    : rep.economicModel;
                return {
                  ...rep,
                  economicModel: updatedModel,
                  liveEnrichment,
                };
              }
            } catch {
              // Keep existing representation if BSC RPC fails
            }
          } else if (rep.providerId === "xstocks") {
            try {
              const xstocksResult = await this.xstocksRpcFetcher(rep.contractAddress);
              if (xstocksResult) {
                const liveEnrichment = xstocksMultiplierToEnrichment(xstocksResult, rep.contractAddress);
                const updatedModel: EconomicModel =
                  rep.economicModel.mechanism === "redemption_rate"
                    ? { ...rep.economicModel, currentRate: xstocksResult.multiplierValue }
                    : rep.economicModel;
                return {
                  ...rep,
                  economicModel: updatedModel,
                  liveEnrichment,
                };
              }
            } catch {
              // Keep existing representation if BSC RPC fails
            }
          }
          return rep;
        })
      ),
    ]);

    // Merge: Direct on-chain BSC RPC takes precedence over Binance for bstocks/xstocks
    const mergedRepresentations = baseline.representations.map((baseRep) => {
      const onChainRep = onChainEnriched.find(
        (r) => r.contractAddress.toLowerCase() === baseRep.contractAddress.toLowerCase()
      );
      const binanceRep = binanceRepsResult.find(
        (r) => r.contractAddress.toLowerCase() === baseRep.contractAddress.toLowerCase()
      );

      if (onChainRep && onChainRep.liveEnrichment) {
        return { ...onChainRep, ...(binanceRep?.binanceMetadata ? { binanceMetadata: binanceRep.binanceMetadata } : {}) };
      }
      if (binanceRep && (binanceRep.liveEnrichment || binanceRep.binanceMetadata)) {
        return binanceRep;
      }
      return baseRep;
    });

    return {
      ...baseline,
      representations: mergedRepresentations,
    };
  }

  public async lookupByContractAsync(contractAddress: string): Promise<ContractLookupResult> {
    const baseline = this.lookupByContract(contractAddress);
    if (!baseline.success) {
      return baseline;
    }

    let matchedRep = baseline.matchedRepresentation;

    // Execute Binance enrichment and direct on-chain BSC RPC concurrently
    const [binanceRepResult, onChainRepResult] = await Promise.all([
      this.enrichmentAdapter
        .enrichSingleRepresentationAsync(matchedRep, baseline.underlying.ticker)
        .catch(() => matchedRep),

      (async () => {
        if (matchedRep.providerId === "bstocks") {
          try {
            const bscResult = await this.bscRpcFetcher(matchedRep.contractAddress);
            if (bscResult) {
              const liveEnrichment = bscMultiplierToEnrichment(bscResult, matchedRep.contractAddress);
              const updatedModel: EconomicModel =
                matchedRep.economicModel.mechanism === "multiplier"
                  ? { ...matchedRep.economicModel, currentMultiplier: bscResult.multiplierValue }
                  : matchedRep.economicModel;
              return {
                ...matchedRep,
                economicModel: updatedModel,
                liveEnrichment,
              };
            }
          } catch {
            // Keep existing
          }
        } else if (matchedRep.providerId === "xstocks") {
          try {
            const xstocksResult = await this.xstocksRpcFetcher(matchedRep.contractAddress);
            if (xstocksResult) {
              const liveEnrichment = xstocksMultiplierToEnrichment(xstocksResult, matchedRep.contractAddress);
              const updatedModel: EconomicModel =
                matchedRep.economicModel.mechanism === "redemption_rate"
                  ? { ...matchedRep.economicModel, currentRate: xstocksResult.multiplierValue }
                  : matchedRep.economicModel;
              return {
                ...matchedRep,
                economicModel: updatedModel,
                liveEnrichment,
              };
            }
          } catch {
            // Keep existing
          }
        }
        return matchedRep;
      })(),
    ]);

    if (onChainRepResult && onChainRepResult.liveEnrichment) {
      matchedRep = { ...onChainRepResult, ...(binanceRepResult?.binanceMetadata ? { binanceMetadata: binanceRepResult.binanceMetadata } : {}) };
    } else if (binanceRepResult && (binanceRepResult.liveEnrichment || binanceRepResult.binanceMetadata)) {
      matchedRep = binanceRepResult;
    }

    return {
      ...baseline,
      matchedRepresentation: matchedRep,
    };
  }

}
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
