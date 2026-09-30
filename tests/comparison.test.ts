import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  buildEquityComparison,
  buildEquityComparisonAsync,
  calculateTokenValue,
  normalizeRepresentationComparison,
  getUnderlyingEquityReference,
} from "@/lens/comparison";
import { defaultBinanceClient } from "@/providers/binance";
import type { TokenizedRepresentation } from "@/types/token";
import type { UnderlyingEquityReference } from "@/types/comparison";
import type { BinanceRawStockRecord } from "@/types/binance";

const MOCK_BINANCE_RECORDS: BinanceRawStockRecord[] = [
  {
    chainId: "56",
    contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
    symbol: "NVDAon",
    ticker: "NVDA",
    type: 1,
    assetType: 1,
    multiplier: "1.0017152487959898",
    lastUpdateTime: 1788998689203,
    d: 18,
  },
  {
    chainId: "56",
    contractAddress: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
    symbol: "NVDAB",
    ticker: "NVDA",
    type: 3,
    assetType: 1,
    multiplier: "1.000778223752807865",
    cs: "NVDABUSDT",
    asset: "NVDAB",
    lastUpdateTime: 1789012513889,
    d: 18,
  },
  {
    chainId: "CT_501",
    contractAddress: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
    symbol: "NVDAx",
    ticker: "NVDA",
    type: 2,
    assetType: 1,
    multiplier: "1.001701196801074",
    lastUpdateTime: 1789000204896,
    d: 8,
  },
];

describe("Phase 7D: Comparison Domain & Normalization Engine", () => {
  beforeEach(() => {
    defaultBinanceClient.clearCache();
    defaultBinanceClient.setFetchFn(
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          data: MOCK_BINANCE_RECORDS,
        }),
      }) as unknown as typeof fetch
    );
  });

  afterEach(() => {
    defaultBinanceClient.clearCache();
    defaultBinanceClient.setFetchFn(undefined);
  });

  it("resolves underlying benchmark reference for NVDA with truthful market status", () => {
    const ref = getUnderlyingEquityReference("NVDA");
    expect(ref).not.toBeNull();
    expect(ref?.ticker).toBe("NVDA");
    expect(ref?.name).toBe("NVIDIA Corporation");
    expect(ref?.referencePriceUSD).toBe(224.15);
    expect(ref?.marketStatus).toBe("MARKET_CLOSED");
    expect(ref?.referenceFeedId).toBe(
      "b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593"
    );
  });

  it("returns null underlying reference for unverified tickers", () => {
    const ref = getUnderlyingEquityReference("XYZUNKNOWN");
    expect(ref).toBeNull();
  });

  it("builds complete comparison matrix for NVDA with all three representations", async () => {
    const matrix = await buildEquityComparisonAsync("NVDA");
    expect(matrix).not.toBeNull();
    expect(matrix?.underlying.ticker).toBe("NVDA");
    expect(matrix?.representations).toHaveLength(3);

    const ondo = matrix?.representations.find((r) => r.providerId === "ondo");
    const bstocks = matrix?.representations.find((r) => r.providerId === "bstocks");
    const xstocks = matrix?.representations.find((r) => r.providerId === "xstocks");

    expect(ondo).toBeDefined();
    expect(bstocks).toBeDefined();
    expect(xstocks).toBeDefined();
  });

  it("correctly normalizes NVDAon (Ondo Auto-DRIP) with live scale factor", async () => {
    const matrix = await buildEquityComparisonAsync("NVDA");
    const ondo = matrix?.representations.find((r) => r.providerId === "ondo")!;

    expect(ondo.normalizationStatus).toBe("AVAILABLE");
    expect(ondo.factorLabel).toBe("Scale Factor");
    expect(ondo.accountingFactor).toBeCloseTo(1.001715, 5);
    expect(ondo.shareEquivalentPerToken).toBeCloseTo(1.001715, 5);
    expect(ondo.referenceValuePerTokenUSD).toBeCloseTo(1.00171525 * 224.15, 2);
    expect(ondo.dexMarketPriceUSD).toBe(224.4999);
    expect(ondo.dexLiquidityTier).toBe("MODERATE");
    expect(ondo.referenceDeviationPercent).toBeCloseTo(-0.0154, 3);
  });

  it("correctly normalizes NVDAB (bStocks Multiplier Model) with live multiplier", async () => {
    const matrix = await buildEquityComparisonAsync("NVDA");
    const bstocks = matrix?.representations.find((r) => r.providerId === "bstocks")!;

    expect(bstocks.normalizationStatus).toBe("AVAILABLE");
    expect(bstocks.factorLabel).toBe("Multiplier");
    expect(bstocks.accountingFactor).toBeCloseTo(1.000778, 5);
    expect(bstocks.shareEquivalentPerToken).toBeCloseTo(1.000778, 5);
    expect(bstocks.referenceValuePerTokenUSD).toBeCloseTo(1.00077822 * 224.15, 2);
    expect(bstocks.dexMarketPriceUSD).toBe(223.9252);
    expect(bstocks.dexLiquidityTier).toBe("HIGH");
    expect(bstocks.referenceDeviationPercent).toBeCloseTo(-0.1779, 3);
  });

  it("normalizes NVDAx (xStocks on BSC) with live on-chain multiplier when available", async () => {
    const matrix = await buildEquityComparisonAsync("NVDA");
    const xstocks = matrix?.representations.find((r) => r.providerId === "xstocks")!;

    expect(["AVAILABLE", "UNAVAILABLE"]).toContain(xstocks.normalizationStatus);
    if (xstocks.normalizationStatus === "AVAILABLE") {
      expect(xstocks.factorLabel).toBe("Multiplier");
      expect(xstocks.accountingFactor).toBeCloseTo(1.001701, 5);
      expect(xstocks.shareEquivalentPerToken).toBeCloseTo(1.001701, 5);
      expect(xstocks.referenceValuePerTokenUSD).toBeCloseTo(1.0017011968 * 224.15, 2);
      expect(xstocks.factorSource).toBe("BNB Smart Chain");
    } else {
      expect(xstocks.unavailabilityReason).toContain(
        "Live normalization factor unavailable in this session"
      );
    }
  });

  it("HARD INTEGRITY REGRESSION: enforces NO silent factor = 1.0 fallback when factor is missing", () => {
    const mockRep: TokenizedRepresentation = {
      providerId: "ondo",
      providerName: "Ondo Finance",
      issuer: "Ondo Global Markets",
      tokenSymbol: "NVDAon",
      tokenName: "NVIDIA (Ondo Tokenized)",
      chain: "BNB Smart Chain",
      chainId: 56,
      contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
      decimals: 18,
      tokenStandard: "BEP-20",
      status: "ACTIVE",
      economicModel: {
        mechanism: "auto_drip_scaled",
        description: "Total-return tracker with automated dividend reinvestment (DRIP)",
        scaledUiEnabled: true,
        dividendHandling: "automatic_dividend_reinvestment_drip",
        tokenPriceTracksNav: true,
        provenance: {
          sourceClass: "FIRST_PARTY",
          sourceName: "Ondo Docs",
          confidence: "HIGH",
        },
      },
      provenance: {
        sourceClass: "ON_CHAIN",
        sourceName: "BSC RPC",
        confidence: "HIGH",
      },
      // liveEnrichment is omitted / missing!
    };

    const mockUnderlying: UnderlyingEquityReference = {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      exchange: "NASDAQ",
      quoteCurrency: "USD",
      referencePriceUSD: 224.15,
      referencePriceType: "TRADITIONAL_EQUITY_REFERENCE",
      referenceSource: "Pyth Network",
      referenceFeedId: "b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593",
      marketStatus: "MARKET_CLOSED",
      marketSchedule: "America/New_York;0930-1600",
      provenance: {
        sourceClass: "ORACLE",
        sourceName: "Pyth Network",
        confidence: "HIGH",
      },
    };

    const normalized = normalizeRepresentationComparison(mockRep, mockUnderlying);

    expect(normalized.normalizationStatus).toBe("UNAVAILABLE");
    expect(normalized.accountingFactor).toBeNull();
    expect(normalized.shareEquivalentPerToken).toBeNull();
    expect(normalized.referenceValuePerTokenUSD).toBeNull();
    expect(normalized.referenceDeviationPercent).toBeNull();
  });
});

describe("Phase 7D: Token Value Calculator", () => {
  let activeMatrix: any;

  beforeEach(async () => {
    defaultBinanceClient.clearCache();
    defaultBinanceClient.setFetchFn(
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          data: MOCK_BINANCE_RECORDS,
        }),
      }) as unknown as typeof fetch
    );

    activeMatrix = await buildEquityComparisonAsync("NVDA");
  });

  afterEach(() => {
    defaultBinanceClient.clearCache();
    defaultBinanceClient.setFetchFn(undefined);
  });

  it("calculates 100 NVDAon (Ondo Auto-DRIP) accurately", () => {
    const result = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "ondo",
        tokenAmount: 100,
      },
      activeMatrix
    );

    expect(result.isValid).toBe(true);
    expect(result.normalizationStatus).toBe("AVAILABLE");
    expect(result.rawTokenAmount).toBe(100);
    expect(result.accountingFactor).toBeCloseTo(1.001715, 5);
    expect(result.shareEquivalentAmount).toBeCloseTo(100.1715, 3);
    expect(result.underlyingReferencePriceUSD).toBe(224.15);
    expect(result.totalReferenceValueUSD).toBeCloseTo(22453.45, 1);
    expect(result.mechanismAccretionUSD).toBeCloseTo(38.45, 1);
  });

  it("calculates positive decimal amounts (12.5 NVDAB)", () => {
    const result = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "bstocks",
        tokenAmount: 12.5,
      },
      activeMatrix
    );

    expect(result.isValid).toBe(true);
    expect(result.normalizationStatus).toBe("AVAILABLE");
    expect(result.rawTokenAmount).toBe(12.5);
    expect(result.accountingFactor).toBeCloseTo(1.000778, 5);
    expect(result.shareEquivalentAmount).toBeCloseTo(12.5 * 1.00077822, 4);
    expect(result.totalReferenceValueUSD).toBeCloseTo(12.5 * 1.00077822 * 224.15, 2);
  });

  it("handles zero token amount cleanly", () => {
    const result = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "ondo",
        tokenAmount: 0,
      },
      activeMatrix
    );

    expect(result.isValid).toBe(true);
    expect(result.rawTokenAmount).toBe(0);
    expect(result.shareEquivalentAmount).toBe(0);
    expect(result.totalReferenceValueUSD).toBe(0);
    expect(result.mechanismAccretionUSD).toBe(0);
  });

  it("rejects negative token amounts with a clear validation error", () => {
    const result = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "ondo",
        tokenAmount: -50,
      },
      activeMatrix
    );

    expect(result.isValid).toBe(false);
    expect(result.validationError).toBe("Token amount must be a positive number.");
    expect(result.shareEquivalentAmount).toBeNull();
    expect(result.totalReferenceValueUSD).toBeNull();
  });

  it("rejects invalid / NaN token amounts", () => {
    const result = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "ondo",
        tokenAmount: Number.NaN,
      },
      activeMatrix
    );

    expect(result.isValid).toBe(false);
    expect(result.validationError).toBe("Please enter a valid numeric token amount.");
  });

  it("handles NVDAx (xStocks on BSC) in calculator accurately without defaulting to 1.0", () => {
    const result = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "xstocks",
        tokenAmount: 100,
      },
      activeMatrix
    );

    expect(result.isValid).toBe(true);
    expect(["AVAILABLE", "UNAVAILABLE"]).toContain(result.normalizationStatus);
    if (result.normalizationStatus === "AVAILABLE") {
      expect(result.accountingFactor).toBeCloseTo(1.001701, 5);
      expect(result.shareEquivalentAmount).toBeCloseTo(100.1701, 3);
      expect(result.totalReferenceValueUSD).toBeCloseTo(100.17011968 * 224.15, 1);
    } else {
      expect(result.accountingFactor).toBeNull();
      expect(result.shareEquivalentAmount).toBeNull();
      expect(result.totalReferenceValueUSD).toBeNull();
    }
  });
  it("Phase 8D: ensures clean product copy without network timeout jargon when normalization is unavailable", () => {
    const mockOndoUnenriched: TokenizedRepresentation = {
      providerId: "ondo",
      providerName: "Ondo Finance",
      issuer: "Ondo Global Markets",
      tokenSymbol: "NVDAon",
      tokenName: "NVIDIA (Ondo Tokenized)",
      chain: "BNB Smart Chain",
      chainId: 56,
      contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
      decimals: 18,
      tokenStandard: "BEP-20",
      status: "ACTIVE",
      economicModel: {
        mechanism: "auto_drip_scaled",
        description: "Total-return tracker with automated dividend reinvestment (DRIP)",
        scaledUiEnabled: true,
        dividendHandling: "automatic_dividend_reinvestment_drip",
        tokenPriceTracksNav: true,
        provenance: {
          sourceClass: "FIRST_PARTY",
          sourceName: "Ondo Docs",
          confidence: "HIGH",
        },
      },
      provenance: {
        sourceClass: "ON_CHAIN",
        sourceName: "BSC RPC",
        confidence: "HIGH",
      },
    };

    const underlying = getUnderlyingEquityReference("NVDA")!;
    const normalized = normalizeRepresentationComparison(mockOndoUnenriched, underlying);

    expect(normalized.normalizationStatus).toBe("UNAVAILABLE");
    expect(normalized.unavailabilityReason).toBe(
      "Live normalization factor unavailable in this session. TickerKin preserves the verified representation data without assuming a conversion factor."
    );
    expect(normalized.unavailabilityReason).not.toContain("Network timeout");
    expect(normalized.unavailabilityReason).not.toContain("unreachable");
  });

  it("Phase 8D: ensures missing DEX spot price produces null deviation rather than invalid deviation or empty units", () => {
    const mockRepNoDex: TokenizedRepresentation = {
      providerId: "xstocks",
      providerName: "xStocks / Backed",
      issuer: "Backed Finance",
      tokenSymbol: "NVDAx",
      tokenName: "NVIDIA (xStocks Tokenized)",
      chain: "BNB Smart Chain",
      chainId: 56,
      contractAddress: "0xc845b2894dbddd03858fd2d643b4ef725fe0849d",
      decimals: 18,
      tokenStandard: "BEP-20",
      status: "ACTIVE",
      economicModel: {
        mechanism: "redemption_rate",
        description: "Continuous Redemption Rate certificate tracker tracking total return",
        dividendHandling: "redemption_rate_adjustment_or_usdc_airdrop",
        currentRate: 1.001701196801074,
        provenance: {
          sourceClass: "ON_CHAIN",
          sourceName: "BSC RPC (0x1b3ed722)",
          confidence: "HIGH",
        },
      },
      provenance: {
        sourceClass: "ON_CHAIN",
        sourceName: "BSC RPC",
        confidence: "HIGH",
      },
      liveEnrichment: {
        rawMultiplier: "1.001701196801074000",
        multiplierValue: 1.001701196801074,
        lastUpdateTime: 1789000204896,
        lastUpdateIso: "2026-09-30T00:00:00.000Z",
        matchConfidence: "HIGH",
        matchBasis: "DIRECT_ON_CHAIN_BSC_ETH_CALL",
        provenance: {
          sourceClass: "ON_CHAIN",
          sourceName: "BSC RPC (0x1b3ed722)",
          confidence: "HIGH",
        },
      },
      // Secondary DEX market price is null
      priceInfo: undefined,
      marketInfo: undefined,
    };

    const underlying = getUnderlyingEquityReference("NVDA")!;
    const normalized = normalizeRepresentationComparison(mockRepNoDex, underlying);

    expect(normalized.dexMarketPriceUSD).toBeNull();
    expect(normalized.referenceDeviationPercent).toBeNull();
  });
});

