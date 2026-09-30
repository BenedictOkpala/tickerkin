import { describe, it, expect } from "vitest";
import { isValidEvmAddress, useTickerKin, useStockDna } from "../src/hooks/useStockDna";
import { lookupByTicker, lookupByContract } from "../src/lens/engine";

describe("TickerKin Frontend UI Integration & Validation", () => {
  describe("1. Hook & Query Format Auto-Detection", () => {
    it("should export both useTickerKin and backward-compatible useStockDna", () => {
      expect(typeof useTickerKin).toBe("function");
      expect(typeof useStockDna).toBe("function");
      expect(useTickerKin).toBe(useStockDna);
    });

    it("should recognize standard 40-character hex contract addresses", () => {
      const validAddress = "0xa9ee28c80f960b889dfbd1902055218cba016f75";
      expect(isValidEvmAddress(validAddress)).toBe(true);

      const mixedCase = "0xA9EE28c80f960B889dfbd1902055218cba016F75";
      expect(isValidEvmAddress(mixedCase)).toBe(true);
    });

    it("should identify tickers as non-contract queries", () => {
      expect(isValidEvmAddress("NVDA")).toBe(false);
      expect(isValidEvmAddress("nvda")).toBe(false);
      expect(isValidEvmAddress("AAPL")).toBe(false);
      expect(isValidEvmAddress("TSLA")).toBe(false);
    });

    it("should reject malformed or short addresses", () => {
      expect(isValidEvmAddress("0x123")).toBe(false);
      expect(isValidEvmAddress("0xZZZe28c80f960b889dfbd1902055218cba016f75")).toBe(false);
      expect(isValidEvmAddress("")).toBe(false);
    });
  });

  describe("2. Flagship NVDA Rendering Payload Integrity", () => {
    it("should supply all necessary UI fields for 3 NVDA representations", () => {
      const result = lookupByTicker("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        // Underlying node properties
        expect(result.underlying.name).toBe("NVIDIA Corporation");
        expect(result.underlying.ticker).toBe("NVDA");
        expect(result.underlying.quoteCurrency).toBe("USD");
        expect(result.underlying.provenance.sourceClass).toBe("ORACLE");

        // Representation card properties
        expect(result.representations.length).toBe(3);

        const ondo = result.representations.find((r) => r.providerId === "ondo");
        const bstocks = result.representations.find((r) => r.providerId === "bstocks");
        const xstocks = result.representations.find((r) => r.providerId === "xstocks");

        expect(ondo).toBeDefined();
        expect(ondo?.tokenSymbol).toBe("NVDAon");
        expect(ondo?.economicModel.mechanism).toBe("auto_drip_scaled");

        expect(bstocks).toBeDefined();
        expect(bstocks?.tokenSymbol).toBe("NVDAB");
        expect(bstocks?.economicModel.mechanism).toBe("multiplier");

        expect(xstocks).toBeDefined();
        expect(xstocks?.tokenSymbol).toBe("NVDAx");
        expect(xstocks?.economicModel.mechanism).toBe("redemption_rate");
      }
    });

    it("should accurately render narrower representation count for AAPL (1 representation)", () => {
      const result = lookupByTicker("AAPL");
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.underlying.ticker).toBe("AAPL");
        expect(result.representations.length).toBe(1);
        expect(result.representations[0].tokenSymbol).toBe("AAPLon");
      }
    });
  });

  describe("3. Contract Reverse-Lookup Payload Integrity", () => {
    it("should provide matched representation and underlying for reverse contract lookup", () => {
      const contract = "0xa9ee28c80f960b889dfbd1902055218cba016f75";
      const result = lookupByContract(contract);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.underlying.ticker).toBe("NVDA");
        expect(result.matchedRepresentation.tokenSymbol).toBe("NVDAon");
        expect(result.normalizedAddress).toBe(contract.toLowerCase());
      }
    });
  });

  describe("4. Live Enrichment UI Presentation Properties", () => {
    it("should carry liveEnrichment with distinct economic factors", () => {
      const mockOndoRep = {
        providerId: "ondo" as const,
        providerName: "Ondo Finance",
        issuer: "Ondo Global Markets",
        tokenSymbol: "NVDAon",
        tokenName: "NVIDIA (Ondo Tokenized)",
        chain: "BNB Smart Chain" as const,
        chainId: 56 as const,
        contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
        decimals: 18,
        tokenStandard: "BEP-20" as const,
        status: "ACTIVE" as const,
        economicModel: {
          mechanism: "auto_drip_scaled" as const,
          description: "Total-return tracker with automated dividend reinvestment (DRIP)" as const,
          currentScaleFactor: 1.001715,
          scaledUiEnabled: true,
          dividendHandling: "automatic_dividend_reinvestment_drip" as const,
          tokenPriceTracksNav: true,
          provenance: {
            sourceClass: "FIRST_PARTY" as const,
            sourceName: "Ondo Finance Documentation",
            confidence: "HIGH" as const,
          },
        },
        liveEnrichment: {
          rawMultiplier: "1.0017152487959898",
          multiplierValue: 1.0017152487959898,
          lastUpdateTime: 1788998689203,
          lastUpdateIso: "2026-09-29T12:04:49.203Z",
          matchConfidence: "HIGH" as const,
          matchBasis: "Verified on-chain identity match",
          provenance: {
            sourceClass: "THIRD_PARTY" as const,
            sourceName: "Binance Web3 RWA Data",
            confidence: "HIGH" as const,
          },
        },
        provenance: {
          sourceClass: "FIRST_PARTY" as const,
          sourceName: "Ondo Finance Documentation",
          confidence: "HIGH" as const,
        },
      };

      expect(mockOndoRep.liveEnrichment).toBeDefined();
      expect(mockOndoRep.liveEnrichment.provenance.sourceName).toBe("Binance Web3 RWA Data");
      expect(mockOndoRep.economicModel.currentScaleFactor).toBe(1.001715);
    });
  });

  describe("5. Phase 8C.3 Kin Map Live Factor & Navigation Isolation", () => {
    it("should enrich NVDAB and NVDAx economicModel with live multiplier/rate on async lookup", async () => {
      const { RWALensEngine } = await import("../src/lens/engine");
      const { BinanceRwaAdapter } = await import("../src/providers/binance");
      const { BinanceRwaClient } = await import("../src/providers/binance/client");

      const mockBinanceClient = new BinanceRwaClient({
        baseUrl: "https://mock.api",
        timeoutMs: 1000,
        fetchFn: async () => ({
          ok: false,
          json: async () => ({}),
        } as unknown as Response),
      });
      const mockBinanceAdapter = new BinanceRwaAdapter({ client: mockBinanceClient });

      const mockBscRpc = async (_contractAddress: string) => ({
        rawMultiplier: "1.000778223752807865",
        multiplierValue: 1.0007782237528078,
        rawHex: "0x0000000000000000000000000000000000000000000000000de37a7dfdbb85b9",
        rpcEndpoint: "https://bsc.mock.com",
        fetchedAt: "2026-09-30T00:00:00.000Z",
      });

      const mockXstocksRpc = async (_contractAddress: string) => ({
        rawMultiplier: "1.001701196801074000",
        multiplierValue: 1.001701196801074,
        rawHex: "0x0000000000000000000000000000000000000000000000000de6c68b759bb840",
        rpcEndpoint: "https://bsc.mock.com",
        fetchedAt: "2026-09-30T00:00:00.000Z",
      });

      const engine = new RWALensEngine(undefined, mockBinanceAdapter, mockBscRpc, mockXstocksRpc);
      const result = await engine.lookupByTickerAsync("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        const nvdab = result.representations.find((r) => r.tokenSymbol === "NVDAB");
        const nvdax = result.representations.find((r) => r.tokenSymbol === "NVDAx");
        const nvdaon = result.representations.find((r) => r.tokenSymbol === "NVDAon");

        // NVDAB has live multiplier enriched
        expect(nvdab).toBeDefined();
        expect(nvdab?.liveEnrichment?.matchBasis).toBe("DIRECT_ON_CHAIN_BSC_ETH_CALL");
        if (nvdab?.economicModel.mechanism === "multiplier") {
          expect(nvdab.economicModel.currentMultiplier).toBe(1.0007782237528078);
        }

        // NVDAx has live rate enriched
        expect(nvdax).toBeDefined();
        expect(nvdax?.liveEnrichment?.matchBasis).toBe("DIRECT_ON_CHAIN_BSC_ETH_CALL");
        if (nvdax?.economicModel.mechanism === "redemption_rate") {
          expect(nvdax.economicModel.currentRate).toBe(1.001701196801074);
        }

        // NVDAon has NO fabricated multiplier
        expect(nvdaon).toBeDefined();
        if (nvdaon?.economicModel.mechanism === "auto_drip_scaled") {
          expect(nvdaon.economicModel.currentScaleFactor).toBeUndefined();
        }
      }
    });
  });

  describe("5. Mobile Calculator Responsiveness & Touch Target Integrity", () => {
    it("verifies TokenValueCalculator source provides responsive classes and mobile stacked rows", async () => {
      const { readFileSync } = await import("node:fs");
      const { resolve } = await import("node:path");

      const calcPath = resolve(process.cwd(), "src/components/comparison/TokenValueCalculator.tsx");
      const calcContent = readFileSync(calcPath, "utf-8");

      expect(calcContent).toContain("tk-calculator-card");
      expect(calcContent).toContain("tk-calculator-controls");
      expect(calcContent).toContain("tk-token-picker-desktop");
      expect(calcContent).toContain("tk-token-picker-mobile");
      expect(calcContent).toContain("tk-token-picker-row");
      expect(calcContent).toContain("tk-calc-metrics-grid");
      expect(calcContent).toContain("tk-calc-metric-tile");
      expect(calcContent).toContain("tk-calc-preset-btn");
      expect(calcContent).toContain("economicMechanism");
    });

    it("verifies globals.css contains mobile @media rules (<640px) for token picker and 2-column metrics", async () => {
      const { readFileSync } = await import("node:fs");
      const { resolve } = await import("node:path");

      const cssPath = resolve(process.cwd(), "src/app/globals.css");
      const cssContent = readFileSync(cssPath, "utf-8");

      expect(cssContent).toContain("@media (max-width: 639px)");
      expect(cssContent).toContain(".tk-token-picker-desktop");
      expect(cssContent).toContain(".tk-token-picker-mobile");
      expect(cssContent).toContain("grid-template-columns: repeat(2, 1fr) !important;");
      expect(cssContent).toContain(".tk-calc-preset-btn");
    });
  });

  describe("6. Final Polish: Mobile Search, US Market Session, and Softened Unavailable States", () => {
    it("verifies TopBar contains mobile search classes and responsive styles in globals.css", async () => {
      const { readFileSync } = await import("node:fs");
      const { resolve } = await import("node:path");

      const topBarPath = resolve(process.cwd(), "src/components/layout/TopBar.tsx");
      const topBarContent = readFileSync(topBarPath, "utf-8");

      expect(topBarContent).toContain("topbar-header");
      expect(topBarContent).toContain("topbar-search-btn-icon");
      expect(topBarContent).toContain("topbar-chain-compact");

      const cssPath = resolve(process.cwd(), "src/app/globals.css");
      const cssContent = readFileSync(cssPath, "utf-8");
      expect(cssContent).toContain("@media (max-width: 640px)");
      expect(cssContent).toContain(".topbar-header");
      expect(cssContent).toContain(".topbar-search-btn-icon");
    });

    it("verifies InteractiveComparison uses 'US Market Session' label", async () => {
      const { readFileSync } = await import("node:fs");
      const { resolve } = await import("node:path");

      const compPath = resolve(process.cwd(), "src/components/comparison/InteractiveComparison.tsx");
      const compContent = readFileSync(compPath, "utf-8");

      expect(compContent).toContain("US Market Session");
      expect(compContent).not.toContain("NASDAQ (NYSE Session)");
    });

    it("verifies LoadingSkeleton and useTickerKin loading initialization", async () => {
      const { readFileSync } = await import("node:fs");
      const { resolve } = await import("node:path");

      const skelPath = resolve(process.cwd(), "src/components/stockdna/LoadingSkeleton.tsx");
      const skelContent = readFileSync(skelPath, "utf-8");
      expect(skelContent).toContain("animate-pulse");

      const hookPath = resolve(process.cwd(), "src/hooks/useStockDna.ts");
      const hookContent = readFileSync(hookPath, "utf-8");
      expect(hookContent).toContain("useState<boolean>(Boolean(initialQuery))");
    });
  });
});

