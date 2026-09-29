import { describe, it, expect } from "vitest";
import {
  calculateTokenValue,
  getUnderlyingEquityReference,
  normalizeRepresentationComparison,
} from "@/lens/comparison";
import { lookupByTicker } from "@/lens";
import type { EquityComparisonMatrix } from "@/types/comparison";

describe("Phase 8A: UX Polish, Copy Integrity, and Accessibility Tests", () => {
  const nvdaLookup = lookupByTicker("NVDA");
  if (!nvdaLookup.success) {
    throw new Error("NVDA not found in verified registry");
  }

  const ondoRep = nvdaLookup.representations.find((r) => r.providerId === "ondo")!;
  const bstocksRep = {
    ...nvdaLookup.representations.find((r) => r.providerId === "bstocks")!,
    liveEnrichment: {
      rawMultiplier: "1.000778223752807865",
      multiplierValue: 1.0007782237528078,
      lastUpdateIso: "2026-09-29T20:00:00.000Z",
      decimals: 18,
      matchConfidence: "HIGH" as const,
      matchBasis: "DIRECT_ON_CHAIN_BSC_ETH_CALL" as const,
      provenance: {
        sourceClass: "ON_CHAIN" as const,
        sourceName: "BNB Smart Chain (eth_call multiplier())",
        confidence: "HIGH" as const,
      },
    },
  };
  const xstocksRep = nvdaLookup.representations.find((r) => r.providerId === "xstocks")!;

  const underlying = getUnderlyingEquityReference("NVDA")!;

  const testMatrix: EquityComparisonMatrix = {
    underlying,
    representations: [
      normalizeRepresentationComparison(ondoRep, underlying),
      normalizeRepresentationComparison(bstocksRep, underlying),
      normalizeRepresentationComparison(xstocksRep, underlying),
    ],
    generatedAt: new Date().toISOString(),
  };

  it("1. selects NVDAB as preferred default when it has AVAILABLE live normalization", () => {
    const available = testMatrix.representations.find((r) => r.normalizationStatus === "AVAILABLE");
    expect(available).toBeDefined();
    expect(available?.providerId).toBe("bstocks");
    expect(available?.tokenSymbol).toBe("NVDAB");
  });

  it("2. allows selecting unavailable representations without crashing or assuming 1:1", () => {
    const ondoCalc = calculateTokenValue(
      { ticker: "NVDA", providerId: "ondo", tokenAmount: 100 },
      testMatrix
    );
    expect(ondoCalc.isValid).toBe(true);
    expect(ondoCalc.normalizationStatus).toBe("UNAVAILABLE");
    expect(ondoCalc.shareEquivalentAmount).toBeNull();
    expect(ondoCalc.accountingFactor).toBeNull();

    const xstocksCalc = calculateTokenValue(
      { ticker: "NVDA", providerId: "xstocks", tokenAmount: 100 },
      testMatrix
    );
    expect(xstocksCalc.isValid).toBe(true);
    expect(xstocksCalc.normalizationStatus).toBe("UNAVAILABLE");
    expect(xstocksCalc.shareEquivalentAmount).toBeNull();
    expect(xstocksCalc.accountingFactor).toBeNull();
  });

  it("3. REGRESSION TEST: prevents provider-specific copy leaks (Ondo & bStocks do not show Backed/Swiss copy)", () => {
    // bStocks test
    const bstocksComp = testMatrix.representations.find((r) => r.providerId === "bstocks")!;
    expect(bstocksComp.issuer).toBe("BTech Holdings Limited");
    expect(bstocksComp.providerName).toBe("Binance bStocks");

    // Ondo test
    const ondoComp = testMatrix.representations.find((r) => r.providerId === "ondo")!;
    expect(ondoComp.issuer).toContain("Ondo Global Markets");
    expect(ondoComp.providerName).toContain("Ondo Finance");
    expect(ondoComp.unavailabilityReason).not.toContain("Swiss DLT");
    expect(ondoComp.unavailabilityReason).not.toContain("Backed Assets");

    // xStocks test
    const xstocksComp = testMatrix.representations.find((r) => r.providerId === "xstocks")!;
    expect(xstocksComp.issuer).toBe("Backed Assets (JE) Limited");
    expect(xstocksComp.unavailabilityReason).toContain("Verified BSC redemption/conversion factor unavailable.");
  });

  it("4. uses Multiplier terminology for NVDAB on-chain BSC calculations", () => {
    const bstocksCalc = calculateTokenValue(
      { ticker: "NVDA", providerId: "bstocks", tokenAmount: 100 },
      testMatrix
    );
    expect(bstocksCalc.factorLabel).toBe("Multiplier");
    expect(bstocksCalc.economicMechanism).toContain("Multiplier Model");
    expect(bstocksCalc.source).toBe("BNB Smart Chain");
  });

  it("5. uses Auto-DRIP terminology for Ondo representation", () => {
    const ondoComp = testMatrix.representations.find((r) => r.providerId === "ondo")!;
    expect(ondoComp.factorLabel).toBe("Scale Factor");
    expect(ondoComp.economicMechanism).toContain("Auto-DRIP");
  });

  it("6. verifies that NVDAx explicitly refuses to assume 1 token = 1 share", () => {
    const xstocksComp = testMatrix.representations.find((r) => r.providerId === "xstocks")!;
    expect(xstocksComp.unavailabilityReason).toContain("will not assume 1 token equals 1 share");
    expect(xstocksComp.shareEquivalentPerToken).toBeNull();
    expect(xstocksComp.referenceValuePerTokenUSD).toBeNull();
  });

  it("7. verifies live vs snapshot provenance distinctions", () => {
    const bstocksComp = testMatrix.representations.find((r) => r.providerId === "bstocks")!;
    expect(bstocksComp.dataFreshness).toBe("LIVE");
    expect(bstocksComp.factorSource).toBe("BNB Smart Chain");

    expect(underlying.marketStatus).toBe("MARKET_CLOSED");
    expect(underlying.referenceSource).toContain("Pyth Network");
  });

  it("8. preserves exact calculator math for 100 NVDAB", () => {
    const result = calculateTokenValue(
      { ticker: "NVDA", providerId: "bstocks", tokenAmount: 100 },
      testMatrix
    );

    expect(result.isValid).toBe(true);
    expect(result.normalizationStatus).toBe("AVAILABLE");
    expect(result.rawTokenAmount).toBe(100);
    expect(result.accountingFactor).toBeCloseTo(1.0007782237528078, 8);
    expect(result.shareEquivalentAmount).toBeCloseTo(100.07782237528, 5);
    expect(result.underlyingReferencePriceUSD).toBe(224.15);
    expect(result.totalReferenceValueUSD).toBeCloseTo(100.07782237528 * 224.15, 2);
    expect(result.mechanismAccretionUSD).toBeCloseTo(
      100.07782237528 * 224.15 - 100 * 224.15,
      2
    );
  });
});
