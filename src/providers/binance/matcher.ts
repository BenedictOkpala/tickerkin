import type { TokenizedRepresentation, ProviderId } from "@/types/token";
import type { BinanceRawStockRecord, IdentityMatchResult } from "@/types/binance";

/**
 * Maps Binance provider integer types to RWA Lens ProviderIds.
 */
export function mapBinanceTypeToProviderId(type: number): ProviderId | null {
  switch (type) {
    case 1:
      return "ondo";
    case 2:
      return "xstocks";
    case 3:
      return "bstocks";
    default:
      return null;
  }
}

/**
 * Maps RWA Lens ProviderIds to Binance provider integer types.
 */
export function mapProviderIdToBinanceType(providerId: ProviderId): number | null {
  switch (providerId) {
    case "ondo":
      return 1;
    case "xstocks":
      return 2;
    case "bstocks":
      return 3;
    default:
      return null;
  }
}

/**
 * Performs chain-aware, address-level identity resolution.
 *
 * CRITICAL INTEGRITY RULES:
 * 1. Never enrich a representation using ticker alone.
 * 2. Contract comparison must be chain-aware (BSC 56 != Solana CT_501).
 * 3. EVM addresses use case-insensitive comparison.
 * 4. Provider identity and underlying ticker must also be compatible.
 */
export function matchRepresentationIdentity(
  representation: TokenizedRepresentation,
  underlyingTicker: string,
  candidateRecord: BinanceRawStockRecord
): IdentityMatchResult {
  // 1. Underlying Ticker must match
  if (
    !candidateRecord.ticker ||
    candidateRecord.ticker.trim().toUpperCase() !== underlyingTicker.trim().toUpperCase()
  ) {
    return {
      matched: false,
      confidence: "NO_MATCH",
      matchBasis: "Ticker mismatch",
    };
  }

  // 2. Provider Type must match
  const mappedProvider = mapBinanceTypeToProviderId(candidateRecord.type);
  if (mappedProvider !== representation.providerId) {
    return {
      matched: false,
      confidence: "NO_MATCH",
      matchBasis: `Provider type mismatch (Binance type ${candidateRecord.type} != ${representation.providerId})`,
    };
  }

  // 3. Chain must match (RWA Lens representation chainId: 56)
  const isBscCandidate = candidateRecord.chainId === "56" || candidateRecord.chainId === "bsc";
  const repIsBsc = representation.chainId === 56;

  if (!isBscCandidate || !repIsBsc) {
    return {
      matched: false,
      confidence: "NO_MATCH",
      matchBasis: `Chain mismatch: representation is chainId ${representation.chainId}, record is chainId '${candidateRecord.chainId}'`,
    };
  }

  // 4. Contract Address must match (case-insensitive EVM check)
  const repAddress = representation.contractAddress.trim().toLowerCase();
  const candAddress = candidateRecord.contractAddress.trim().toLowerCase();

  if (repAddress !== candAddress) {
    return {
      matched: false,
      confidence: "NO_MATCH",
      matchBasis: `Contract address mismatch: representation '${repAddress}' != record '${candAddress}'`,
    };
  }

  // 5. Multiplier must be a valid numeric string
  const numMultiplier = Number.parseFloat(candidateRecord.multiplier);
  if (Number.isNaN(numMultiplier) || !Number.isFinite(numMultiplier) || numMultiplier <= 0) {
    return {
      matched: false,
      confidence: "NO_MATCH",
      matchBasis: `Malformed multiplier value in external record: '${candidateRecord.multiplier}'`,
    };
  }

  return {
    matched: true,
    confidence: "HIGH",
    matchBasis: `Verified on-chain identity match on BSC (chainId: 56) with contract ${repAddress} for provider ${representation.providerId}`,
    record: candidateRecord,
  };
}

/**
 * Finds the exact matching Binance record from a list of candidates for a given representation.
 */
export function findMatchingBinanceRecord(
  representation: TokenizedRepresentation,
  underlyingTicker: string,
  records: readonly BinanceRawStockRecord[]
): IdentityMatchResult {
  for (const record of records) {
    const match = matchRepresentationIdentity(representation, underlyingTicker, record);
    if (match.matched) {
      return match;
    }
  }

  return {
    matched: false,
    confidence: "NO_MATCH",
    matchBasis: "No candidate record satisfied chain, contract address, and provider identity requirements",
  };
}
