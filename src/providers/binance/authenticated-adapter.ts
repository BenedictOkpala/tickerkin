import type { TokenizedRepresentation } from "@/types/token";
import type { BinanceSearchObservation } from "@/types/binance";
import { AuthenticatedBinanceWeb3Client } from "./authenticated-client";

export function attachSearchMetadata(rep: TokenizedRepresentation, ticker: string,
  result: BinanceSearchObservation): TokenizedRepresentation {
  const matches = result.assets.filter((asset) =>
    asset.ticker.trim().toUpperCase() === ticker.trim().toUpperCase() &&
    asset.providerId === rep.providerId && asset.chainId === rep.chainId &&
    asset.contractAddress.toLowerCase() === rep.contractAddress.toLowerCase());
  // Duplicate candidates are ambiguous; fail closed rather than selecting the first.
  if (matches.length !== 1) return rep;
  return { ...rep, binanceMetadata: {
    companyName: matches[0].companyName, tokenSymbol: matches[0].tokenSymbol,
    retrievedAt: result.retrievedAt, freshness: result.freshness,
    provenance: { sourceClass: "THIRD_PARTY", confidence: "HIGH",
      sourceName: "Binance Web3 authenticated RWA search",
      sourceRef: "https://web3.binance.com/build/api/v1/dex/market/rwa/search",
      notes: "Matched underlying, platform, BSC chain and exact contract. Identity metadata only; not normalization evidence." },
  } };
}
export class AuthenticatedBinanceEnrichmentAdapter {
  constructor(private readonly fallback: {
    enrichRepresentationsAsync(reps: readonly TokenizedRepresentation[], ticker: string): Promise<readonly TokenizedRepresentation[]>;
    enrichSingleRepresentationAsync(rep: TokenizedRepresentation, ticker: string): Promise<TokenizedRepresentation>;
  }, private readonly client = new AuthenticatedBinanceWeb3Client()) {}
  async enrichRepresentationsAsync(reps: readonly TokenizedRepresentation[], ticker: string) {
    // Legacy public factors remain a separately attributed source: search has no factor field.
    const [legacy, search] = await Promise.all([
      this.fallback.enrichRepresentationsAsync(reps, ticker).catch(() => reps),
      this.client.search(ticker).catch(() => null),
    ]);
    return search ? legacy.map((rep) => attachSearchMetadata(rep, ticker, search)) : legacy;
  }
  async enrichSingleRepresentationAsync(rep: TokenizedRepresentation, ticker: string) {
    return (await this.enrichRepresentationsAsync([rep], ticker))[0];
  }
}
