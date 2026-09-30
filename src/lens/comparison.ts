import type {
  EquityComparisonMatrix,
  NormalizedRepresentationComparison,
  UnderlyingEquityReference,
  TokenCalculationInput,
  TokenCalculationOutput,
  DexLiquidityTier,
  FactorLabel,
} from "@/types/comparison";
import type { TokenizedRepresentation } from "@/types/token";
import { lookupByTicker, lookupByTickerAsync } from "./engine";
import { formatEconomicMechanism, getClaimScopedEvidence } from "./presentation";

/**
 * Verified secondary DEX liquidity pools and spot pricing on BNB Smart Chain.
 * Bound strictly to verified BEP-20 contract addresses.
 */
interface VerifiedDexPoolEntry {
  readonly contractAddress: string;
  readonly dexName: string;
  readonly poolAddress: string | null;
  readonly priceUSD: number | null;
  readonly reserveUSD: number | null;
  readonly liquidityTier: DexLiquidityTier;
  readonly dataFreshness: "LIVE" | "CACHED" | "UNAVAILABLE";
}

const VERIFIED_BSC_DEX_POOLS: ReadonlyMap<string, VerifiedDexPoolEntry> = new Map([
  // bStocks NVDAB on BSC
  [
    "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
    {
      contractAddress: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
      dexName: "PancakeSwap v3/v2",
      poolAddress: "0x8fb4243b553ac29ba088acf00b9b7da24bd6690c",
      priceUSD: 223.9252,
      reserveUSD: 3550969.05,
      liquidityTier: "HIGH",
      dataFreshness: "CACHED",
    },
  ],
  // Ondo NVDAon on BSC
  [
    "0xa9ee28c80f960b889dfbd1902055218cba016f75",
    {
      contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
      dexName: "PancakeSwap",
      poolAddress: "0xb90bdbfbdffd4af5a636b5805539edeafb969308",
      priceUSD: 224.4999,
      reserveUSD: 14007.36,
      liquidityTier: "MODERATE",
      dataFreshness: "CACHED",
    },
  ],
  // xStocks NVDAx on BSC (Illiquid on BSC)
  [
    "0xc845b2894dbddd03858fd2d643b4ef725fe0849d",
    {
      contractAddress: "0xc845b2894dbddd03858fd2d643b4ef725fe0849d",
      dexName: "PancakeSwap (Low Secondary Reserve)",
      poolAddress: null,
      priceUSD: null,
      reserveUSD: 295.56,
      liquidityTier: "LOW",
      dataFreshness: "UNAVAILABLE",
    },
  ],
]);

/**
 * Retrieves the verified traditional equity benchmark reference for an equity ticker.
 */
export function getUnderlyingEquityReference(ticker: string): UnderlyingEquityReference | null {
  const cleanTicker = ticker.trim().toUpperCase();

  if (cleanTicker === "NVDA") {
    return {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      exchange: "NASDAQ",
      quoteCurrency: "USD",
      referencePriceUSD: 224.15,
      referencePriceType: "TRADITIONAL_EQUITY_REFERENCE",
      referenceSource: "Pyth Network Hermes (Equity.US.NVDA/USD)",
      referenceFeedId: "b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593",
      marketStatus: "MARKET_CLOSED",
      marketSchedule: "America/New_York;0930-1600,0930-1600,0930-1600,0930-1600,0930-1600,C,C",
      timestamp: "2026-09-29T16:00:00.000Z",
      provenance: {
        sourceClass: "ORACLE",
        sourceName: "Pyth Network Hermes & BSC Oracle",
        sourceRef: "https://hermes.pyth.network/v2/price_feeds?query=NVDA",
        confidence: "HIGH",
        notes: "Verified NASDAQ equity session schedule and 24/7 tokenized feed identifiers on BSC",
      },
    };
  }

  return null;
}

/**
 * Normalizes a single representation into the comparison schema.
 *
 * CRITICAL INTEGRITY RULES:
 * 1. Never assume factor = 1.0 when live factor is missing.
 * 2. Never borrow Solana xStocks rates for BSC representation.
 * 3. Unavailable dynamic data must be marked as UNAVAILABLE with explicit nulls.
 */
export function normalizeRepresentationComparison(
  representation: TokenizedRepresentation,
  underlying: UnderlyingEquityReference
): NormalizedRepresentationComparison {
  const contractLower = representation.contractAddress.toLowerCase();
  const dexInfo = VERIFIED_BSC_DEX_POOLS.get(contractLower);

  const dexPrice = dexInfo?.priceUSD ?? null;
  const dexLiquidity = dexInfo?.reserveUSD ?? null;
  const dexTier = dexInfo?.liquidityTier ?? "UNAVAILABLE";
  const dexPool = dexInfo?.poolAddress ?? null;
  const dexName = dexInfo?.dexName ?? null;

  // Determine Factor and Normalization Status
  let accountingFactor: number | null = null;
  let factorLabel: FactorLabel = "Unavailable";
  let factorSource: string | undefined = undefined;
  let normalizationStatus: "AVAILABLE" | "UNAVAILABLE" = "UNAVAILABLE";
  let unavailabilityReason: string | undefined = undefined;

  if (representation.providerId === "ondo") {
    factorLabel = "Scale Factor";
    if (representation.liveEnrichment?.rawMultiplier) {
      const parsed = Number.parseFloat(representation.liveEnrichment.rawMultiplier);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed) && parsed > 0) {
        accountingFactor = parsed;
        normalizationStatus = "AVAILABLE";
        factorSource = "Binance Web3 RWA API (Type 1)";
      }
    }
    if (normalizationStatus === "UNAVAILABLE") {
      unavailabilityReason =
        "Live normalization factor unavailable in this session. TickerKin preserves the verified representation data without assuming a conversion factor.";
    }
  } else if (representation.providerId === "bstocks") {
    factorLabel = "Multiplier";
    if (representation.liveEnrichment?.rawMultiplier) {
      const parsed = Number.parseFloat(representation.liveEnrichment.rawMultiplier);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed) && parsed > 0) {
        accountingFactor = parsed;
        normalizationStatus = "AVAILABLE";
        factorSource =
          representation.liveEnrichment.matchBasis === "DIRECT_ON_CHAIN_BSC_ETH_CALL"
            ? "BNB Smart Chain"
            : "Binance Web3 RWA API (Type 3)";
      }
    }
    if (normalizationStatus === "UNAVAILABLE") {
      unavailabilityReason =
        "Live normalization factor unavailable in this session. TickerKin preserves the verified representation data without assuming a conversion factor.";
    }
  } else if (representation.providerId === "xstocks") {
    factorLabel = "Multiplier";
    if (representation.liveEnrichment?.rawMultiplier) {
      const parsed = Number.parseFloat(representation.liveEnrichment.rawMultiplier);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed) && parsed > 0) {
        accountingFactor = parsed;
        normalizationStatus = "AVAILABLE";
        factorSource =
          representation.liveEnrichment.matchBasis === "DIRECT_ON_CHAIN_BSC_ETH_CALL"
            ? "BNB Smart Chain"
            : "Binance Web3 RWA API (Type 2)";
      }
    }
    if (normalizationStatus === "UNAVAILABLE") {
      unavailabilityReason =
        "Live normalization factor unavailable in this session. TickerKin preserves the verified representation data without assuming a conversion factor.";
    }
  }

  // Calculate Share-Equivalent and Reference Value (only when factor is available)
  let shareEquivalentPerToken: number | null = null;
  let referenceValuePerTokenUSD: number | null = null;
  let referenceDeviationPercent: number | null = null;

  if (normalizationStatus === "AVAILABLE" && accountingFactor !== null && underlying.referencePriceUSD !== null) {
    shareEquivalentPerToken = accountingFactor;
    referenceValuePerTokenUSD = accountingFactor * underlying.referencePriceUSD;

    // Calculate Reference Deviation only when DEX price, factor, and reference price are all present
    if (dexPrice !== null && referenceValuePerTokenUSD > 0) {
      referenceDeviationPercent = ((dexPrice / referenceValuePerTokenUSD) - 1) * 100;
    }
  }

  // Generate Claim-Scoped Provenance
  const baseUnderlying = {
    ticker: underlying.ticker,
    name: underlying.name,
    exchange: underlying.exchange,
    quoteCurrency: underlying.quoteCurrency,
    marketHours: {
      isOpen: underlying.marketStatus === "LIVE",
      schedule: underlying.marketSchedule,
      timezone: "America/New_York",
    },
    provenance: underlying.provenance,
  };

  const claims = getClaimScopedEvidence(representation, baseUnderlying);

  return {
    providerId: representation.providerId,
    providerName: representation.providerName,
    issuer: representation.issuer,
    tokenSymbol: representation.tokenSymbol,
    tokenName: representation.tokenName,
    contractAddress: representation.contractAddress,
    chain: representation.chain,
    chainId: representation.chainId,
    decimals: representation.decimals,
    economicMechanism: formatEconomicMechanism(representation.economicModel.mechanism),
    economicMechanismKey: representation.economicModel.mechanism,
    normalizationStatus,
    accountingFactor,
    factorLabel,
    factorSource,
    shareEquivalentPerToken,
    referenceValuePerTokenUSD,
    dexMarketPriceUSD: dexPrice,
    dexLiquidityUSD: dexLiquidity,
    dexLiquidityTier: dexTier,
    dexPoolAddress: dexPool,
    dexPoolName: dexName,
    referenceDeviationPercent,
    dataTimestamp: representation.liveEnrichment?.lastUpdateIso ?? underlying.timestamp,
    dataFreshness: normalizationStatus === "AVAILABLE" ? "LIVE" : "UNAVAILABLE",
    unavailabilityReason,
    provenance: representation.provenance,
    claims,
  };
}

/**
 * Builds the complete Equity Comparison Matrix synchronously.
 */
export function buildEquityComparison(
  ticker: string,
  enrichedRepresentations?: readonly TokenizedRepresentation[]
): EquityComparisonMatrix | null {
  const cleanTicker = ticker.trim().toUpperCase();
  const underlying = getUnderlyingEquityReference(cleanTicker);

  if (!underlying) {
    return null;
  }

  let representations = enrichedRepresentations;

  if (!representations) {
    const lookup = lookupByTicker(cleanTicker);
    if (!lookup.success) {
      return null;
    }
    representations = lookup.representations;
  }

  const comparisonRepresentations = representations.map((rep) =>
    normalizeRepresentationComparison(rep, underlying)
  );

  return {
    underlying,
    representations: comparisonRepresentations,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Builds the complete Equity Comparison Matrix asynchronously with dynamic enrichment.
 */
export async function buildEquityComparisonAsync(
  ticker: string
): Promise<EquityComparisonMatrix | null> {
  const cleanTicker = ticker.trim().toUpperCase();
  const underlying = getUnderlyingEquityReference(cleanTicker);

  if (!underlying) {
    return null;
  }

  const lookup = await lookupByTickerAsync(cleanTicker);
  if (!lookup.success) {
    return null;
  }

  return buildEquityComparison(cleanTicker, lookup.representations);
}

/**
 * Computes token value calculations for the "What is my token worth?" calculator.
 *
 * CRITICAL INTEGRITY ENFORCEMENT:
 * Strictly verifies no silent fallback to factor = 1.0.
 */
export function calculateTokenValue(
  input: TokenCalculationInput,
  matrix?: EquityComparisonMatrix | null
): TokenCalculationOutput {
  const cleanTicker = input.ticker.trim().toUpperCase();

  // 1. Validate Input Amount
  if (
    input.tokenAmount === undefined ||
    input.tokenAmount === null ||
    Number.isNaN(input.tokenAmount) ||
    !Number.isFinite(input.tokenAmount)
  ) {
    return {
      ticker: cleanTicker,
      providerId: input.providerId,
      tokenSymbol: cleanTicker,
      tokenName: cleanTicker,
      rawTokenAmount: 0,
      normalizationStatus: "UNAVAILABLE",
      economicMechanism: "Unknown",
      accountingFactor: null,
      factorLabel: "Unavailable",
      shareEquivalentAmount: null,
      underlyingReferencePriceUSD: null,
      totalReferenceValueUSD: null,
      mechanismAccretionUSD: null,
      source: "Input Validation",
      freshness: "UNAVAILABLE",
      isValid: false,
      validationError: "Please enter a valid numeric token amount.",
      provenance: {
        sourceClass: "FIRST_PARTY",
        sourceName: "TickerKin Calculator Engine",
        confidence: "HIGH",
      },
    };
  }

  if (input.tokenAmount < 0) {
    return {
      ticker: cleanTicker,
      providerId: input.providerId,
      tokenSymbol: cleanTicker,
      tokenName: cleanTicker,
      rawTokenAmount: input.tokenAmount,
      normalizationStatus: "UNAVAILABLE",
      economicMechanism: "Unknown",
      accountingFactor: null,
      factorLabel: "Unavailable",
      shareEquivalentAmount: null,
      underlyingReferencePriceUSD: null,
      totalReferenceValueUSD: null,
      mechanismAccretionUSD: null,
      source: "Input Validation",
      freshness: "UNAVAILABLE",
      isValid: false,
      validationError: "Token amount must be a positive number.",
      provenance: {
        sourceClass: "FIRST_PARTY",
        sourceName: "TickerKin Calculator Engine",
        confidence: "HIGH",
      },
    };
  }

  // 2. Resolve or Build Comparison Matrix
  const activeMatrix = matrix ?? buildEquityComparison(cleanTicker);

  if (!activeMatrix) {
    return {
      ticker: cleanTicker,
      providerId: input.providerId,
      tokenSymbol: cleanTicker,
      tokenName: cleanTicker,
      rawTokenAmount: input.tokenAmount,
      normalizationStatus: "UNAVAILABLE",
      economicMechanism: "Unknown",
      accountingFactor: null,
      factorLabel: "Unavailable",
      shareEquivalentAmount: null,
      underlyingReferencePriceUSD: null,
      totalReferenceValueUSD: null,
      mechanismAccretionUSD: null,
      source: "Registry",
      freshness: "UNAVAILABLE",
      isValid: false,
      validationError: `No verified tokenized representations found for ticker '${cleanTicker}'.`,
      provenance: {
        sourceClass: "FIRST_PARTY",
        sourceName: "TickerKin Registry",
        confidence: "HIGH",
      },
    };
  }

  const rep = activeMatrix.representations.find((r) => r.providerId === input.providerId);

  if (!rep) {
    return {
      ticker: cleanTicker,
      providerId: input.providerId,
      tokenSymbol: cleanTicker,
      tokenName: cleanTicker,
      rawTokenAmount: input.tokenAmount,
      normalizationStatus: "UNAVAILABLE",
      economicMechanism: "Unknown",
      accountingFactor: null,
      factorLabel: "Unavailable",
      shareEquivalentAmount: null,
      underlyingReferencePriceUSD: activeMatrix.underlying.referencePriceUSD,
      totalReferenceValueUSD: null,
      mechanismAccretionUSD: null,
      source: "Registry",
      freshness: "UNAVAILABLE",
      isValid: false,
      validationError: `Provider '${input.providerId}' is not registered for '${cleanTicker}'.`,
      provenance: {
        sourceClass: "FIRST_PARTY",
        sourceName: "TickerKin Registry",
        confidence: "HIGH",
      },
    };
  }

  // 3. Handle UNAVAILABLE Normalization (e.g. NVDAx on BSC)
  if (rep.normalizationStatus !== "AVAILABLE" || rep.accountingFactor === null) {
    return {
      ticker: cleanTicker,
      providerId: rep.providerId,
      tokenSymbol: rep.tokenSymbol,
      tokenName: rep.tokenName,
      rawTokenAmount: input.tokenAmount,
      normalizationStatus: "UNAVAILABLE",
      economicMechanism: rep.economicMechanism,
      accountingFactor: null,
      factorLabel: rep.factorLabel,
      shareEquivalentAmount: null,
      underlyingReferencePriceUSD: activeMatrix.underlying.referencePriceUSD,
      totalReferenceValueUSD: null,
      mechanismAccretionUSD: null,
      source: rep.factorSource ?? "Verified Provider Registry",
      freshness: "UNAVAILABLE",
      unavailabilityReason:
        rep.unavailabilityReason ??
        "Live normalization factor unavailable in this session. TickerKin preserves the verified representation data without assuming a conversion factor.",
      isValid: true,
      provenance: rep.provenance,
    };
  }

  // 4. Handle AVAILABLE Normalization (Ondo Auto-DRIP, bStocks Multiplier)
  const factor = rep.accountingFactor;
  const refPrice = activeMatrix.underlying.referencePriceUSD ?? 0;

  const shareEquivalent = input.tokenAmount * factor;
  const totalReferenceValueUSD = shareEquivalent * refPrice;
  const rawBaselineValueUSD = input.tokenAmount * refPrice;
  const mechanismAccretionUSD = totalReferenceValueUSD - rawBaselineValueUSD;

  return {
    ticker: cleanTicker,
    providerId: rep.providerId,
    tokenSymbol: rep.tokenSymbol,
    tokenName: rep.tokenName,
    rawTokenAmount: input.tokenAmount,
    normalizationStatus: "AVAILABLE",
    economicMechanism: rep.economicMechanism,
    accountingFactor: factor,
    factorLabel: rep.factorLabel,
    shareEquivalentAmount: shareEquivalent,
    underlyingReferencePriceUSD: refPrice,
    totalReferenceValueUSD,
    mechanismAccretionUSD,
    source: rep.factorSource ?? "Binance Web3 RWA API",
    freshness: rep.dataFreshness,
    isValid: true,
    provenance: rep.provenance,
  };
}
