import type { BinanceRawStockRecord, BinanceRawResponseEnvelope } from "@/types/binance";

export interface BinanceClientOptions {
  readonly baseUrl?: string;
  readonly timeoutMs?: number;
  readonly cacheTtlMs?: number;
  readonly fetchFn?: typeof fetch;
}

const DEFAULT_BASE_URL =
  "https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai";
const DEFAULT_TIMEOUT_MS = 1500;
const DEFAULT_CACHE_TTL_MS = 60_000;

interface CacheEntry {
  readonly timestamp: number;
  readonly records: readonly BinanceRawStockRecord[];
}

/**
 * Type guard for validating a single BinanceRawStockRecord from external JSON.
 */
export function isValidBinanceStockRecord(item: unknown): item is BinanceRawStockRecord {
  if (!item || typeof item !== "object") return false;
  const r = item as Record<string, unknown>;

  return (
    typeof r.chainId === "string" &&
    typeof r.contractAddress === "string" &&
    typeof r.symbol === "string" &&
    typeof r.ticker === "string" &&
    typeof r.type === "number" &&
    typeof r.multiplier === "string"
  );
}

/**
 * Server-side read-only client for the public Binance Web3 RWA Data API.
 */
export class BinanceRwaClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly cacheTtlMs: number;
  private customFetchFn?: typeof fetch;
  private readonly cache = new Map<number, CacheEntry>();

  constructor(options: BinanceClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.cacheTtlMs = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    this.customFetchFn = options.fetchFn;
  }

  /**
   * Allows setting/mocking the fetch implementation at runtime.
   */
  public setFetchFn(fetchFn: typeof fetch | undefined): void {
    this.customFetchFn = fetchFn;
  }

  /**
   * Fetches raw stock records for a specific provider type (1 = Ondo, 2 = xStocks, 3 = bStocks).
   * Utilizes an in-memory TTL cache and fails gracefully on network / parsing errors.
   */
  public async fetchStocksByType(providerType: number): Promise<readonly BinanceRawStockRecord[]> {
    const now = Date.now();
    const cached = this.cache.get(providerType);
    if (cached && now - cached.timestamp < this.cacheTtlMs) {
      return cached.records;
    }

    try {
      const url = `${this.baseUrl}?type=${encodeURIComponent(providerType)}`;
      const signal = AbortSignal.timeout
        ? AbortSignal.timeout(this.timeoutMs)
        : undefined;

      const activeFetch = this.customFetchFn ?? globalThis.fetch;
      const response = await activeFetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "RWALens/1.0",
        },
        signal,
      });

      if (!response.ok) {
        // Cache negative result with TTL to avoid repeated slow timeouts
        this.cache.set(providerType, { timestamp: now, records: cached ? cached.records : [] });
        return cached ? cached.records : [];
      }

      const json = (await response.json()) as BinanceRawResponseEnvelope;

      if (!json || json.code !== "000000" || !Array.isArray(json.data)) {
        this.cache.set(providerType, { timestamp: now, records: cached ? cached.records : [] });
        return cached ? cached.records : [];
      }

      const validRecords = json.data.filter(isValidBinanceStockRecord);

      this.cache.set(providerType, {
        timestamp: now,
        records: validRecords,
      });

      return validRecords;
    } catch {
      // Graceful fallback on network timeout, abort, or parsing failure
      this.cache.set(providerType, { timestamp: now, records: cached ? cached.records : [] });
      return cached ? cached.records : [];
    }
  }

  /**
   * Fetches raw stock records across all known provider types (1, 2, 3) concurrently.
   */
  public async fetchAllStocks(): Promise<readonly BinanceRawStockRecord[]> {
    const results = await Promise.all([
      this.fetchStocksByType(1),
      this.fetchStocksByType(2),
      this.fetchStocksByType(3),
    ]);
    return results.flat();
  }

  /**
   * Clears the in-memory cache (primarily useful for testing).
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Returns current configured base URL.
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }
}

export const defaultBinanceClient = new BinanceRwaClient();
