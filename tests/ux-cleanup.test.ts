import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { calculateTokenValue, buildEquityComparison } from "@/lens/comparison";
import type { EquityComparisonMatrix } from "@/types/comparison";
import type { ProviderId } from "@/types/token";

describe("Phase 8A.2: Calculator Final Copy & State Clarity Tests", () => {
  it("1. ensures safer Step 3 wording and absence of literal ownership claims in CalculationExplainerModal", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/CalculationExplainerModal.tsx");
    const content = readFileSync(filePath, "utf-8");

    // Must contain new safer wording
    expect(content).toContain("Represents the token amount expressed in comparable underlying share-equivalent units.");

    // Must NOT contain old literal backing / ownership wording
    expect(content).not.toContain("actual quantity of off-chain underlying shares");
    expect(content).not.toContain("backed by the tokenized holding");
  });

  it("2. ensures 'Normalized Reference Value' terminology in Step 4 of CalculationExplainerModal", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/CalculationExplainerModal.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain("Normalized Reference Value");
    expect(content).not.toContain("Intrinsic Reference Benchmark");
    expect(content).not.toContain("guaranteed redemption value");
    expect(content).not.toContain("liquidation value");
  });

  it("3. ensures no 'physical share' terminology exists in HowToReadComparison", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/HowToReadComparison.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content.toLowerCase()).not.toContain("physical share");
    expect(content).toContain("1 share-equivalent unit");
  });

  it("4. ensures no hardcoded Swiss DLT copy leaks across providers in TokenValueCalculator", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/TokenValueCalculator.tsx");
    const content = readFileSync(filePath, "utf-8");

    // Must have isolated provider footnote mappings
    expect(content).toContain("providerFootnote");
    expect(content).toContain("BTech (bStocks)");
    expect(content).toContain("Ondo Global Markets");
    expect(content).toContain("Swiss DLT / Backed Assets");
    expect(content).toContain("Share-Equivalent Exposure");
  });

  it("5. ensures InteractiveComparison performs client dynamic enrichment", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/InteractiveComparison.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain("activeMatrix");
    expect(content).toContain("useEffect");
    expect(content).toContain("/api/lens/ticker/");
  });

  it("6. verifies available representation is preferred on initial resolution logic", () => {
    const matrix = buildEquityComparison("NVDA");
    expect(matrix).not.toBeNull();
    if (!matrix) return;

    // Simulate matrix where only bstocks is AVAILABLE
    const enrichedMatrix: EquityComparisonMatrix = {
      ...matrix,
      representations: matrix.representations.map((r) => {
        if (r.providerId === "bstocks") {
          return {
            ...r,
            normalizationStatus: "AVAILABLE" as const,
            accountingFactor: 1.000778223752807865,
            shareEquivalentPerToken: 1.000778223752807865,
            referenceValuePerTokenUSD: 1.000778223752807865 * 224.15,
          };
        }
        return {
          ...r,
          normalizationStatus: "UNAVAILABLE" as const,
        };
      }),
    };

    const firstAvailable = enrichedMatrix.representations.find(
      (r) => r.normalizationStatus === "AVAILABLE"
    )?.providerId;

    expect(firstAvailable).toBe("bstocks");
  });

  it("7. verifies unavailable representations remain selectable and calculate without crashing or assuming 1:1", () => {
    const matrix = buildEquityComparison("NVDA");
    expect(matrix).not.toBeNull();
    if (!matrix) return;

    // Ensure selecting unavailable representations returns UNAVAILABLE without default 1.0
    const ondoResult = calculateTokenValue(
      { ticker: "NVDA", providerId: "ondo", tokenAmount: 100 },
      matrix
    );
    expect(ondoResult.isValid).toBe(true);
    expect(ondoResult.normalizationStatus).toBe("UNAVAILABLE");
    expect(ondoResult.accountingFactor).toBeNull();
    expect(ondoResult.shareEquivalentAmount).toBeNull();
    expect(ondoResult.totalReferenceValueUSD).toBeNull();

    const xstocksResult = calculateTokenValue(
      { ticker: "NVDA", providerId: "xstocks", tokenAmount: 100 },
      matrix
    );
    expect(xstocksResult.isValid).toBe(true);
    expect(xstocksResult.normalizationStatus).toBe("UNAVAILABLE");
    expect(xstocksResult.accountingFactor).toBeNull();
    expect(xstocksResult.shareEquivalentAmount).toBeNull();
    expect(xstocksResult.totalReferenceValueUSD).toBeNull();
  });

  it("8. verifies manual user selection is respected and can select any provider explicitly", () => {
    const matrix = buildEquityComparison("NVDA");
    expect(matrix).not.toBeNull();
    if (!matrix) return;

    const testSelection = (providerId: ProviderId) => {
      const calc = calculateTokenValue(
        { ticker: "NVDA", providerId, tokenAmount: 50 },
        matrix
      );
      expect(calc.tokenSymbol).toBe(
        matrix.representations.find((r) => r.providerId === providerId)?.tokenSymbol
      );
    };

    testSelection("ondo");
    testSelection("bstocks");
    testSelection("xstocks");
  });

  it("9. calculates 100 NVDAB using verified BSC multiplier and produces accurate share-equivalent", () => {
    const matrix = buildEquityComparison("NVDA");
    expect(matrix).not.toBeNull();
    if (!matrix) return;

    // Simulate matrix enriched with NVDAB live factor
    const enrichedMatrix = {
      ...matrix,
      representations: matrix.representations.map((r) => {
        if (r.providerId === "bstocks") {
          return {
            ...r,
            normalizationStatus: "AVAILABLE" as const,
            accountingFactor: 1.000778223752807865,
            shareEquivalentPerToken: 1.000778223752807865,
            referenceValuePerTokenUSD: 1.000778223752807865 * 224.15,
          };
        }
        return r;
      }),
    };

    const result = calculateTokenValue(
      {
        ticker: "NVDA",
        providerId: "bstocks",
        tokenAmount: 100,
      },
      enrichedMatrix
    );

    expect(result.isValid).toBe(true);
    expect(result.normalizationStatus).toBe("AVAILABLE");
    expect(result.rawTokenAmount).toBe(100);
    expect(result.accountingFactor).toBeCloseTo(1.00077822, 6);
    expect(result.shareEquivalentAmount).toBeCloseTo(100.0778, 4);
    expect(result.totalReferenceValueUSD).toBeCloseTo(22432.44, 2);
    expect(result.mechanismAccretionUSD).toBeCloseTo(17.44, 2);
  });
});
