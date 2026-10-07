import { createHmac } from "node:crypto";
import type { BinanceSearchObservation } from "@/types/binance";

// Node-only import and runtime guard retain MCP compatibility without a Next-specific sentinel.
if (typeof window !== "undefined") throw new Error("Binance Web3 transport requires a server runtime");
const BASE = "https://web3.binance.com";
const PATH = "/build/api/v1/dex/market/rwa/search";
export interface AuthenticatedClientOptions {
  readonly fetchFn?: typeof fetch;
  readonly now?: () => Date;
  readonly timeoutMs?: number;
  readonly cacheTtlMs?: number;
}
function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function parseSearchResponse(value: unknown): BinanceSearchObservation["assets"] | null {
  if (!object(value) || value.code !== 0 || value.success !== true || !Array.isArray(value.data)) return null;
  const assets: BinanceSearchObservation["assets"][number][] = [];
  for (const item of value.data) {
    if (!object(item) || typeof item.ticker !== "string" || !item.ticker.trim() ||
        typeof item.companyName !== "string" || !Array.isArray(item.assets)) return null;
    for (const asset of item.assets) {
      if (!object(asset) || typeof asset.platformId !== "string" ||
          typeof asset.binanceChainId !== "string" || typeof asset.tokenContractAddress !== "string" ||
          typeof asset.tokenSymbol !== "string") return null;
      // Explicit allowlist. Unknown platforms/chains never become identity candidates.
      const providerId = asset.platformId === "ondo" ? "ondo" : asset.platformId === "bstock" ? "bstocks" : null;
      if (!providerId || asset.binanceChainId !== "56" ||
          !/^0x[0-9a-fA-F]{40}$/.test(asset.tokenContractAddress)) continue;
      assets.push({ ticker: item.ticker, companyName: item.companyName, providerId,
        chainId: 56, contractAddress: asset.tokenContractAddress, tokenSymbol: asset.tokenSymbol });
    }
  }
  return assets;
}
export class AuthenticatedBinanceWeb3Client {
  private readonly cache = new Map<string, BinanceSearchObservation>();
  constructor(private readonly options: AuthenticatedClientOptions = {}) {}
  async search(keyword: string): Promise<BinanceSearchObservation | null> {
    // Read only the two approved variables, at request time.
    const key = process.env.BINANCE_WEB3_API_KEY;
    const secret = process.env.BINANCE_WEB3_SECRET_KEY;
    if (!key || !secret) return null;
    const now = (this.options.now ?? (() => new Date()))();
    const cached = this.cache.get(keyword);
    if (cached && now.getTime() - Date.parse(cached.retrievedAt) < (this.options.cacheTtlMs ?? 60_000))
      return { ...cached, freshness: "CACHED" };
    const requestPath = PATH + "?" + new URLSearchParams({ keyword }).toString();
    const timestamp = now.toISOString();
    const signature = createHmac("sha256", secret).update(timestamp + "GET" + requestPath + "").digest("base64");
    try {
      const response = await (this.options.fetchFn ?? globalThis.fetch)(BASE + requestPath, {
        method: "GET", headers: { Accept: "application/json",
          "X-OC-APIKEY": key, "X-OC-TIMESTAMP": timestamp, "X-OC-SIGN": signature },
        signal: AbortSignal.timeout(this.options.timeoutMs ?? 1500), cache: "no-store", redirect: "error",
      });
      if (!response.ok) return cached ? { ...cached, freshness: "CACHED" } : null;
      const assets = parseSearchResponse(await response.json());
      if (!assets) return cached ? { ...cached, freshness: "CACHED" } : null;
      // Search documents server response time, not identity observation time.
      const result: BinanceSearchObservation = { assets, retrievedAt: timestamp, freshness: "SNAPSHOT" };
      this.cache.set(keyword, result);
      return result;
    } catch {
      // Never serialize/log upstream errors, headers, signing input, or credentials.
      return cached ? { ...cached, freshness: "CACHED" } : null;
    }
  }
}
