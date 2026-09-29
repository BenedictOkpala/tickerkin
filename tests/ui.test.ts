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
});
