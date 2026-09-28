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

  constructor(registry: readonly RegistryEquityEntry[] = VERIFIED_REGISTRY) {
    this.registry = registry;
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
   * Lookup is case-insensitive.
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
   * Looks up an equity and its representation by BNB Smart Chain contract address.
   * Lookup is case-insensitive.
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
}

/**
 * Singleton instance of the RWA Lens engine.
 */
export const rwaLens = new RWALensEngine();

/**
 * Convenience helper for ticker lookup.
 */
export function lookupByTicker(ticker: string): TickerLookupResult {
  return rwaLens.lookupByTicker(ticker);
}

/**
 * Convenience helper for contract lookup.
 */
export function lookupByContract(contractAddress: string): ContractLookupResult {
  return rwaLens.lookupByContract(contractAddress);
}
