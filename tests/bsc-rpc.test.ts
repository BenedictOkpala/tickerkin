import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  decodeMultiplier18Decimals,
  fetchBStocksMultiplierFromRpc,
  bscMultiplierToEnrichment,
  BSTOCKS_MULTIPLIER_SELECTOR,
  DEFAULT_BSC_RPC_ENDPOINTS,
} from "@/providers/bstocks/bsc-rpc";
import {
  buildEquityComparison,
  buildEquityComparisonAsync,
  calculateTokenValue,
} from "@/lens/comparison";
import type { EquityComparisonMatrix } from "@/types/comparison";

describe("BSC RPC Factor Adapter & Decoding", () => {
  it("verifies DEFAULT_BSC_RPC_ENDPOINTS prioritizes verified low-latency public endpoints", () => {
    expect(DEFAULT_BSC_RPC_ENDPOINTS.length).toBeGreaterThanOrEqual(3);
    expect(DEFAULT_BSC_RPC_ENDPOINTS[0]).toBe("https://bsc.publicnode.com");
    expect(DEFAULT_BSC_RPC_ENDPOINTS[1]).toBe("https://bsc-rpc.publicnode.com");
    expect(DEFAULT_BSC_RPC_ENDPOINTS[2]).toBe("https://bsc-dataseed.binance.org");
  });
  it("safely decodes an 18-decimal fixed-point hex return value", () => {
    // 1000778223752807865 wei -> 1.000778223752807865
    const hex = "0x0000000000000000000000000000000000000000000000000de37a7dfdbb85b9";
    const decoded = decodeMultiplier18Decimals(hex);
    expect(decoded).not.toBeNull();
    expect(decoded?.rawMultiplier).toBe("1.000778223752807865");
    expect(decoded?.multiplierValue).toBeCloseTo(1.0007782237528078, 12);
  });

  it("handles exact 1.0 multiplier hex without distortion", () => {
    // 1e18 wei -> 0x0de0b6b3a7640000
    const hex = "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000";
    const decoded = decodeMultiplier18Decimals(hex);
    expect(decoded).not.toBeNull();
    expect(decoded?.rawMultiplier).toBe("1.000000000000000000");
    expect(decoded?.multiplierValue).toBe(1.0);
  });

  it("rejects zero, negative, or malformed hex inputs", () => {
    expect(decodeMultiplier18Decimals("0x0")).toBeNull();
    expect(decodeMultiplier18Decimals("0x0000000000000000000000000000000000000000000000000000000000000000")).toBeNull();
    expect(decodeMultiplier18Decimals("invalid_hex")).toBeNull();
    expect(decodeMultiplier18Decimals("")).toBeNull();
  });

  it("formats live enrichment metadata with ON_CHAIN provenance", () => {
    const mockResult = {
      rawMultiplier: "1.000778223752807865",
      multiplierValue: 1.0007782237528078,
      rawHex: "0x0000000000000000000000000000000000000000000000000de37a7dfdbb85b9",
      rpcEndpoint: "https://bsc.publicnode.com",
      fetchedAt: "2026-09-29T20:00:00.000Z",
    };
    const contract = "0x02fca66c1d1afb4e2a7884261eb00f63598a7436";
    const enrichment = bscMultiplierToEnrichment(mockResult, contract);

    expect(enrichment.rawMultiplier).toBe("1.000778223752807865");
    expect(enrichment.matchBasis).toBe("DIRECT_ON_CHAIN_BSC_ETH_CALL");
    expect(enrichment.provenance.sourceClass).toBe("ON_CHAIN");
    expect(enrichment.provenance.sourceName).toBe("BNB Smart Chain (eth_call multiplier())");
  });
});

describe("BSC RPC Fetch & Fallback Behavior", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetches multiplier successfully from primary RPC endpoint", async () => {
    const mockHex = "0x0000000000000000000000000000000000000000000000000de37a7dfdbb85b9";
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ jsonrpc: "2.0", id: 1, result: mockHex }),
    });

    const res = await fetchBStocksMultiplierFromRpc(
      "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
      ["https://primary.rpc", "https://secondary.rpc"],
      1000
    );

    expect(res).not.toBeNull();
    expect(res?.rawMultiplier).toBe("1.000778223752807865");
    expect(res?.rpcEndpoint).toBe("https://primary.rpc");
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("falls back to secondary RPC endpoint when primary fails", async () => {
    const mockHex = "0x0000000000000000000000000000000000000000000000000de37a7dfdbb85b9";
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jsonrpc: "2.0", id: 1, result: mockHex }),
      });

    const res = await fetchBStocksMultiplierFromRpc(
      "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
      ["https://primary.rpc", "https://secondary.rpc"],
      1000
    );

    expect(res).not.toBeNull();
    expect(res?.rawMultiplier).toBe("1.000778223752807865");
    expect(res?.rpcEndpoint).toBe("https://secondary.rpc");
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("returns null when all RPC endpoints fail without assuming 1.0", async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("Primary down"))
      .mockRejectedValueOnce(new Error("Secondary down"));

    const res = await fetchBStocksMultiplierFromRpc(
      "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
      ["https://primary.rpc", "https://secondary.rpc"],
      1000
    );

    expect(res).toBeNull();
  });
});

describe("NVDAB Live Normalization & Calculator Math", () => {
  it("normalizes NVDAB with live multiplier from BSC", async () => {
    const matrix = await buildEquityComparisonAsync("NVDA");
    expect(matrix).not.toBeNull();

    const nvdab = matrix?.representations.find((r) => r.providerId === "bstocks");
    expect(nvdab).toBeDefined();

    if (nvdab?.normalizationStatus === "AVAILABLE") {
      expect(nvdab.accountingFactor).toBeGreaterThan(1.0);
      expect(nvdab.factorSource).toBe("BNB Smart Chain");
      expect(nvdab.factorLabel).toBe("Multiplier");
      expect(nvdab.shareEquivalentPerToken).toBe(nvdab.accountingFactor);
      expect(nvdab.referenceValuePerTokenUSD).toBeCloseTo(
        (nvdab.accountingFactor ?? 1) * (matrix?.underlying.referencePriceUSD ?? 224.15),
        2
      );
      expect(nvdab.dataFreshness).toBe("LIVE");
    }
  }, 30000);

  it("calculates 100 NVDAB token normalization correctly", () => {
    // Construct verified matrix fixture with live factor 1.000778223752807865
    const mockMatrix: EquityComparisonMatrix = {
      underlying: {
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        exchange: "NASDAQ",
        quoteCurrency: "USD",
        referencePriceUSD: 224.15,
        referencePriceType: "TRADITIONAL_EQUITY_REFERENCE",
        referenceSource: "Pyth Network Hermes",
        referenceFeedId: "b1073854ed24cbc755dc527418f52b7d271f6cc967bbf8d8129112b18860a593",
        marketStatus: "MARKET_CLOSED",
        marketSchedule: "0930-1600",
        provenance: { sourceClass: "ORACLE", sourceName: "Pyth", confidence: "HIGH" },
      },
      representations: [
        {
          providerId: "bstocks",
          providerName: "Binance bStocks",
          issuer: "BTech Holdings Limited",
          tokenSymbol: "NVDAB",
          tokenName: "NVIDIA Corp",
          contractAddress: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
          chain: "BNB Smart Chain",
          chainId: 56,
          decimals: 18,
          economicMechanism: "Multiplier Model",
          economicMechanismKey: "multiplier",
          normalizationStatus: "AVAILABLE",
          accountingFactor: 1.0007782237528078,
          factorLabel: "Multiplier",
          factorSource: "BNB Smart Chain",
          shareEquivalentPerToken: 1.0007782237528078,
          referenceValuePerTokenUSD: 224.32443885419187,
          dexMarketPriceUSD: 223.9252,
          dexLiquidityUSD: 3550969.05,
          dexLiquidityTier: "HIGH",
          dexPoolAddress: "0x8fb4243b553ac29ba088acf00b9b7da24bd6690c",
          dexPoolName: "PancakeSwap v3/v2",
          referenceDeviationPercent: -0.17797,
          dataFreshness: "LIVE",
          provenance: { sourceClass: "ON_CHAIN", sourceName: "BNB Smart Chain", confidence: "HIGH" },
          claims: [],
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const calc = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "bstocks",
        tokenAmount: 100,
      },
      mockMatrix
    );

    expect(calc.isValid).toBe(true);
    expect(calc.normalizationStatus).toBe("AVAILABLE");
    expect(calc.rawTokenAmount).toBe(100);
    expect(calc.accountingFactor).toBe(1.0007782237528078);
    expect(calc.shareEquivalentAmount).toBeCloseTo(100.077822, 5);
    expect(calc.totalReferenceValueUSD).toBeCloseTo(22432.44, 2);
    expect(calc.mechanismAccretionUSD).toBeCloseTo(17.44, 2);
    expect(calc.source).toBe("BNB Smart Chain");
    expect(calc.freshness).toBe("LIVE");
  });

  it("calculates decimal token amounts (0.5 NVDAB)", () => {
    const mockMatrix: EquityComparisonMatrix = {
      underlying: {
        ticker: "NVDA",
        name: "NVIDIA Corporation",
        exchange: "NASDAQ",
        quoteCurrency: "USD",
        referencePriceUSD: 200.0,
        referencePriceType: "TRADITIONAL_EQUITY_REFERENCE",
        referenceSource: "Pyth",
        referenceFeedId: "b107...",
        marketStatus: "MARKET_CLOSED",
        marketSchedule: "0930-1600",
        provenance: { sourceClass: "ORACLE", sourceName: "Pyth", confidence: "HIGH" },
      },
      representations: [
        {
          providerId: "bstocks",
          providerName: "Binance bStocks",
          issuer: "BTech Holdings",
          tokenSymbol: "NVDAB",
          tokenName: "NVIDIA Corp",
          contractAddress: "0x02fc...",
          chain: "BNB Smart Chain",
          chainId: 56,
          decimals: 18,
          economicMechanism: "Multiplier Model",
          economicMechanismKey: "multiplier",
          normalizationStatus: "AVAILABLE",
          accountingFactor: 1.002,
          factorLabel: "Multiplier",
          factorSource: "BNB Smart Chain",
          shareEquivalentPerToken: 1.002,
          referenceValuePerTokenUSD: 200.4,
          dexMarketPriceUSD: null,
          dexLiquidityUSD: null,
          dexLiquidityTier: "HIGH",
          dexPoolAddress: null,
          dexPoolName: null,
          referenceDeviationPercent: null,
          dataFreshness: "LIVE",
          provenance: { sourceClass: "ON_CHAIN", sourceName: "BSC", confidence: "HIGH" },
          claims: [],
        },
      ],
      generatedAt: new Date().toISOString(),
    };

    const calc = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "bstocks",
        tokenAmount: 0.5,
      },
      mockMatrix
    );

    expect(calc.isValid).toBe(true);
    expect(calc.shareEquivalentAmount).toBeCloseTo(0.501, 4);
    expect(calc.totalReferenceValueUSD).toBeCloseTo(100.2, 2);
  });

  it("handles zero token amounts correctly", () => {
    const mockMatrix = buildEquityComparison("NVDA");
    const calc = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "bstocks",
        tokenAmount: 0,
      },
      mockMatrix
    );

    expect(calc.isValid).toBe(true);
    expect(calc.rawTokenAmount).toBe(0);
  });

  it("preserves UNAVAILABLE data gap for NVDAx and un-enriched Ondo", () => {
    const syncMatrix = buildEquityComparison("NVDA");
    expect(syncMatrix).not.toBeNull();

    const nvdax = syncMatrix?.representations.find((r) => r.providerId === "xstocks");
    expect(nvdax?.normalizationStatus).toBe("UNAVAILABLE");
    expect(nvdax?.accountingFactor).toBeNull();
    expect(nvdax?.shareEquivalentPerToken).toBeNull();
    expect(nvdax?.unavailabilityReason).toContain("Live normalization factor unavailable in this session");

    const calcNvdax = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "xstocks",
        tokenAmount: 100,
      },
      syncMatrix
    );
    expect(calcNvdax.normalizationStatus).toBe("UNAVAILABLE");
    expect(calcNvdax.shareEquivalentAmount).toBeNull();
    expect(calcNvdax.totalReferenceValueUSD).toBeNull();
  });
});
