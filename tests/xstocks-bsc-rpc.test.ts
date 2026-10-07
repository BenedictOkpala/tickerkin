import { describe, it, expect, vi } from "vitest";
import {
  fetchXStocksMultiplierFromRpc,
  xstocksMultiplierToEnrichment,
  XSTOCKS_MULTIPLIER_SELECTOR,
  XSTOCKS_LAST_MULTIPLIER_SELECTOR,
} from "@/providers/xstocks/bsc-rpc";
import { decodeMultiplier18Decimals } from "@/providers/bstocks/bsc-rpc";
import { RWALensEngine } from "@/lens/engine";
import {
  normalizeRepresentationComparison,
  buildEquityComparison,
  calculateTokenValue,
  getUnderlyingEquityReference,
} from "@/lens/comparison";
import type { TokenizedRepresentation } from "@/types/token";
import type { BinanceRwaAdapter } from "@/providers/binance";

const NVDAX_CONTRACT = "0xc845b2894dbddd03858fd2d643b4ef725fe0849d";
const MOCK_NVDAX_HEX = "0x0000000000000000000000000000000000000000000000000de6c1ee66696350"; // 1001701196801074000

describe("Phase 8C: xStocks Direct BSC RPC Adapter & Multiplier Parsing", () => {
  it("defines standard function selector for xStocks multiplier (0x1b3ed722)", () => {
    expect(XSTOCKS_MULTIPLIER_SELECTOR).toBe("0x1b3ed722");
    expect(XSTOCKS_LAST_MULTIPLIER_SELECTOR).toBe("0xd1786aab");
  });

  it("decodes exact 18-decimal uint256 multiplier from 32-byte hex", () => {
    const decoded = decodeMultiplier18Decimals(MOCK_NVDAX_HEX);
    expect(decoded).not.toBeNull();
    expect(decoded?.rawMultiplier).toBe("1.001701196801074000");
    expect(decoded?.multiplierValue).toBeCloseTo(1.001701196801074, 8);
  });

  it("rejects invalid or malformed hex responses", () => {
    expect(decodeMultiplier18Decimals("")).toBeNull();
    expect(decodeMultiplier18Decimals("0x")).toBeNull();
    expect(decodeMultiplier18Decimals("0x1234")).toBeNull(); // Short length
    expect(decodeMultiplier18Decimals("invalid_hex")).toBeNull();
  });

  it("rejects zero or negative uint256 multiplier values", () => {
    const zeroHex = "0x" + "0".repeat(64);
    expect(decodeMultiplier18Decimals(zeroHex)).toBeNull();
  });

  it("fetches live multiplier from mocked BSC RPC eth_call", async () => {
    const originalFetch = globalThis.fetch;
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jsonrpc: "2.0",
        id: 1,
        result: MOCK_NVDAX_HEX,
      }),
    });
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    try {
      const result = await fetchXStocksMultiplierFromRpc(NVDAX_CONTRACT, ["https://mock-bsc-rpc.com"]);
      expect(result).not.toBeNull();
      expect(result?.rawHex).toBe(MOCK_NVDAX_HEX);
      expect(result?.multiplierValue).toBeCloseTo(1.001701196801074, 8);
      expect(result?.rpcEndpoint).toBe("https://mock-bsc-rpc.com");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("handles RPC failure gracefully without throwing or defaulting to 1.0", async () => {
    const originalFetch = globalThis.fetch;
    const mockFetch = vi.fn().mockRejectedValue(new Error("Connection refused"));
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    try {
      const result = await fetchXStocksMultiplierFromRpc(NVDAX_CONTRACT, ["https://mock-bsc-rpc.com"]);
      expect(result).toBeNull();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("converts BSC multiplier result into standard ON_CHAIN live enrichment model", () => {
    const enrichment = xstocksMultiplierToEnrichment(
      {
        rawMultiplier: "1.001701196801074000",
        multiplierValue: 1.001701196801074,
        rawHex: MOCK_NVDAX_HEX,
        rpcEndpoint: "https://bsc-dataseed1.defibit.io",
        fetchedAt: "2026-09-30T06:00:00.000Z",
      },
      NVDAX_CONTRACT
    );

    expect(enrichment.multiplierValue).toBeCloseTo(1.001701196801074, 8);
    expect(enrichment.matchConfidence).toBe("HIGH");
    expect(enrichment.matchBasis).toBe("DIRECT_ON_CHAIN_BSC_ETH_CALL");
    expect(enrichment.provenance.sourceClass).toBe("ON_CHAIN");
    expect(enrichment.provenance.sourceName).toBe("BNB Smart Chain (eth_call multiplier())");
  });
});

describe("Phase 8C: RWA Lens Engine & Comparison Normalization for NVDAx", () => {
  it("enriches NVDAx with direct on-chain multiplier via lookupByTickerAsync", async () => {
    const mockXStocksRpc = vi.fn().mockResolvedValue({
      rawMultiplier: "1.001701196801074000",
      multiplierValue: 1.001701196801074,
      rawHex: MOCK_NVDAX_HEX,
      rpcEndpoint: "https://bsc-dataseed1.defibit.io",
      fetchedAt: "2026-09-30T06:00:00.000Z",
    });

    const mockBinanceAdapter = {
      enrichRepresentationsAsync: vi.fn().mockImplementation(async (reps) => reps),
      enrichSingleRepresentationAsync: vi.fn().mockImplementation(async (rep) => rep),
    } as unknown as BinanceRwaAdapter;

    const engine = new RWALensEngine(
      undefined,
      mockBinanceAdapter,
      async () => null,
      mockXStocksRpc
    );

    const lookup = await engine.lookupByTickerAsync("NVDA");
    expect(lookup.success).toBe(true);
    if (!lookup.success) throw new Error("Lookup failed");

    const nvdax = lookup.representations.find((r) => r.providerId === "xstocks");
    expect(nvdax).toBeDefined();
    expect(nvdax?.liveEnrichment).toBeDefined();
    expect(nvdax?.liveEnrichment?.multiplierValue).toBeCloseTo(1.001701196801074, 8);
    expect(nvdax?.liveEnrichment?.matchBasis).toBe("DIRECT_ON_CHAIN_BSC_ETH_CALL");
  });

  it("normalizes NVDAx as AVAILABLE when on-chain multiplier is present", () => {
    const underlying = getUnderlyingEquityReference("NVDA")!;

    const nvdaxRep: TokenizedRepresentation = {
      providerId: "xstocks",
      providerName: "xStocks (Backed Finance)",
      issuer: "Backed Assets (JE) Limited",
      tokenSymbol: "NVDAx",
      tokenName: "NVIDIA xStock",
      chain: "BNB Smart Chain",
      chainId: 56,
      contractAddress: NVDAX_CONTRACT,
      decimals: 18,
      tokenStandard: "BEP-20",
      status: "ACTIVE",
      economicModel: {
        mechanism: "redemption_rate",
        description: "Continuous Redemption Rate certificate tracker tracking total return",
        dividendHandling: "redemption_rate_adjustment_or_usdc_airdrop",
        provenance: {
          sourceClass: "FIRST_PARTY",
          sourceName: "Backed Documentation",
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
        lastUpdateIso: "2026-09-30T06:00:00.000Z",
        decimals: 18,
        matchConfidence: "HIGH",
        matchBasis: "DIRECT_ON_CHAIN_BSC_ETH_CALL",
        provenance: {
          sourceClass: "ON_CHAIN",
          sourceName: "BNB Smart Chain (eth_call multiplier())",
          confidence: "HIGH",
        },
      },
    };

    const normalized = normalizeRepresentationComparison(nvdaxRep, underlying);

    expect(normalized.normalizationStatus).toBe("AVAILABLE");
    expect(normalized.accountingFactor).toBeCloseTo(1.001701196801074, 8);
    expect(normalized.shareEquivalentPerToken).toBeCloseTo(1.001701196801074, 8);
    expect(normalized.factorLabel).toBe("Multiplier");
    expect(normalized.factorSource).toBe("BNB Smart Chain (eth_call multiplier())");
    expect(normalized.referenceValuePerTokenUSD).toBeCloseTo(1.001701196801074 * 224.15, 2);
  });

  it("maintains UNAVAILABLE status for NVDAx when live factor fails (No 1.0 fallback)", () => {
    const underlying = getUnderlyingEquityReference("NVDA")!;

    const nvdaxRep: TokenizedRepresentation = {
      providerId: "xstocks",
      providerName: "xStocks (Backed Finance)",
      issuer: "Backed Assets (JE) Limited",
      tokenSymbol: "NVDAx",
      tokenName: "NVIDIA xStock",
      chain: "BNB Smart Chain",
      chainId: 56,
      contractAddress: NVDAX_CONTRACT,
      decimals: 18,
      tokenStandard: "BEP-20",
      status: "ACTIVE",
      economicModel: {
        mechanism: "redemption_rate",
        description: "Continuous Redemption Rate certificate tracker tracking total return",
        dividendHandling: "redemption_rate_adjustment_or_usdc_airdrop",
        provenance: {
          sourceClass: "FIRST_PARTY",
          sourceName: "Backed Documentation",
          confidence: "HIGH",
        },
      },
      provenance: {
        sourceClass: "ON_CHAIN",
        sourceName: "BSC RPC",
        confidence: "HIGH",
      },
      // liveEnrichment is omitted
    };

    const normalized = normalizeRepresentationComparison(nvdaxRep, underlying);

    expect(normalized.normalizationStatus).toBe("UNAVAILABLE");
    expect(normalized.accountingFactor).toBeNull();
    expect(normalized.shareEquivalentPerToken).toBeNull();
    expect(normalized.referenceValuePerTokenUSD).toBeNull();
    expect(normalized.unavailabilityReason).toContain("Live normalization factor unavailable in this session");
  });

  it("calculates 100 NVDAx accurately in calculator when live on-chain multiplier is available", () => {
    const rawMatrix = buildEquityComparison("NVDA");
    expect(rawMatrix).not.toBeNull();
    if (!rawMatrix) return;

    // Enriched matrix with both NVDAB and NVDAx live factors
    const enrichedMatrix = {
      ...rawMatrix,
      representations: rawMatrix.representations.map((r) => {
        if (r.providerId === "xstocks") {
          return {
            ...r,
            normalizationStatus: "AVAILABLE" as const,
            accountingFactor: 1.001701196801074,
            shareEquivalentPerToken: 1.001701196801074,
            referenceValuePerTokenUSD: 1.001701196801074 * 224.15,
            factorSource: "BNB Smart Chain",
          };
        }
        return r;
      }),
    };

    const calcResult = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "xstocks",
        tokenAmount: 100,
      },
      enrichedMatrix
    );

    expect(calcResult.isValid).toBe(true);
    expect(calcResult.normalizationStatus).toBe("AVAILABLE");
    expect(calcResult.rawTokenAmount).toBe(100);
    expect(calcResult.accountingFactor).toBeCloseTo(1.001701196801074, 8);
    expect(calcResult.shareEquivalentAmount).toBeCloseTo(100.17011968, 5);
    expect(calcResult.underlyingReferencePriceUSD).toBe(224.15);
    expect(calcResult.totalReferenceValueUSD).toBeCloseTo(22453.13, 1);
    expect(calcResult.mechanismAccretionUSD).toBeCloseTo(38.13, 1);
    expect(calcResult.source).toBe("BNB Smart Chain");
  });

  it("verifies NVDAon remains UNAVAILABLE while NVDAB and NVDAx calculate with on-chain multipliers", () => {
    const rawMatrix = buildEquityComparison("NVDA");
    expect(rawMatrix).not.toBeNull();
    if (!rawMatrix) return;

    const enrichedMatrix = {
      ...rawMatrix,
      representations: rawMatrix.representations.map((r) => {
        if (r.providerId === "bstocks") {
          return {
            ...r,
            normalizationStatus: "AVAILABLE" as const,
            accountingFactor: 1.000778223752807865,
          };
        }
        if (r.providerId === "xstocks") {
          return {
            ...r,
            normalizationStatus: "AVAILABLE" as const,
            accountingFactor: 1.001701196801074,
          };
        }
        return r;
      }),
    };

    const ondoCalc = calculateTokenValue(
      { ticker: "NVDA", providerId: "ondo", tokenAmount: 100 },
      enrichedMatrix
    );
    expect(ondoCalc.normalizationStatus).toBe("UNAVAILABLE");
    expect(ondoCalc.shareEquivalentAmount).toBeNull();
    expect(ondoCalc.totalReferenceValueUSD).toBeNull();

    const bstocksCalc = calculateTokenValue(
      { ticker: "NVDA", providerId: "bstocks", tokenAmount: 100 },
      enrichedMatrix
    );
    expect(bstocksCalc.normalizationStatus).toBe("AVAILABLE");
    expect(bstocksCalc.shareEquivalentAmount).toBeCloseTo(100.0778, 4);

    const xstocksCalc = calculateTokenValue(
      { ticker: "NVDA", providerId: "xstocks", tokenAmount: 100 },
      enrichedMatrix
    );
    expect(xstocksCalc.normalizationStatus).toBe("AVAILABLE");
    expect(xstocksCalc.shareEquivalentAmount).toBeCloseTo(100.1701, 4);
  });
});
