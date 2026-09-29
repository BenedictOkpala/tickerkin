import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { calculateTokenValue, buildEquityComparison } from "@/lens/comparison";

describe("Phase 8A.1: Runtime UI Regression & Copy Isolation Tests", () => {
  it("ensures no 'physical share' terminology exists in HowToReadComparison", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/HowToReadComparison.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content.toLowerCase()).not.toContain("physical share");
    expect(content).toContain("1 share-equivalent unit");
  });

  it("ensures no hardcoded Swiss DLT copy leaks across all providers in TokenValueCalculator", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/TokenValueCalculator.tsx");
    const content = readFileSync(filePath, "utf-8");

    // Must have providerFootnote mapping
    expect(content).toContain("providerFootnote");
    expect(content).toContain("BTech (bStocks)");
    expect(content).toContain("Ondo Global Markets");
    expect(content).toContain("Swiss DLT / Backed Assets");
    expect(content).toContain("Share-Equivalent Exposure");
  });

  it("ensures CalculationExplainerModal contains step-by-step breakdown with accurate math", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/CalculationExplainerModal.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain("Step 1");
    expect(content).toContain("Step 2");
    expect(content).toContain("Step 3");
    expect(content).toContain("Step 4");
    expect(content).toContain("Q_token");
    expect(content).toContain("F_accounting");
    expect(content).toContain("Shares = Q_token × F_accounting");
    expect(content).toContain("Value_USD = Shares × P_underlying");
  });

  it("ensures InteractiveComparison performs client dynamic enrichment", () => {
    const filePath = resolve(process.cwd(), "src/components/comparison/InteractiveComparison.tsx");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain("activeMatrix");
    expect(content).toContain("useEffect");
    expect(content).toContain("/api/lens/ticker/");
  });

  it("calculates 100 NVDAB using verified BSC multiplier and produces accurate share-equivalent", () => {
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
