import { describe, it, expect } from "vitest";
import { lookupByTicker, lookupByContract, rwaLens } from "../src/lens/engine";

describe("RWA Lens Core Engine", () => {
  describe("1. Ticker Lookups", () => {
    it("should successfully look up NVDA and return all 3 verified representations", () => {
      const result = lookupByTicker("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.underlying.ticker).toBe("NVDA");
        expect(result.underlying.name).toBe("NVIDIA Corporation");
        expect(result.underlying.quoteCurrency).toBe("USD");
        expect(result.representations.length).toBe(3);

        const providerIds = result.representations.map((r) => r.providerId);
        expect(providerIds).toContain("ondo");
        expect(providerIds).toContain("bstocks");
        expect(providerIds).toContain("xstocks");
      }
    });

    it("should handle lowercase 'nvda' case-insensitively", () => {
      const result = lookupByTicker("nvda");
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.underlying.ticker).toBe("NVDA");
        expect(result.representations.length).toBe(3);
      }
    });

    it("should return a clean typed error for unsupported tickers", () => {
      const result = lookupByTicker("UNKNOWN_TICKER");
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe("TICKER_NOT_FOUND");
        expect(result.message).toContain("UNKNOWN_TICKER");
      }
    });

    it("should handle empty or whitespace ticker cleanly", () => {
      const result = lookupByTicker("   ");
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe("TICKER_NOT_FOUND");
      }
    });
  });

  describe("2. Reverse Contract Address Lookups", () => {
    it("should resolve Ondo NVDA contract address", () => {
      const ondoContract = "0xa9ee28c80f960b889dfbd1902055218cba016f75";
      const result = lookupByContract(ondoContract);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.underlying.ticker).toBe("NVDA");
        expect(result.matchedRepresentation.providerId).toBe("ondo");
        expect(result.matchedRepresentation.tokenSymbol).toBe("NVDAon");
        expect(result.matchedRepresentation.contractAddress).toBe(ondoContract);
      }
    });

    it("should resolve bStocks NVDA contract address", () => {
      const bstocksContract = "0x02fca66c1d1afb4e2a7884261eb00f63598a7436";
      const result = lookupByContract(bstocksContract);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.underlying.ticker).toBe("NVDA");
        expect(result.matchedRepresentation.providerId).toBe("bstocks");
        expect(result.matchedRepresentation.tokenSymbol).toBe("NVDAB");
        expect(result.matchedRepresentation.contractAddress).toBe(bstocksContract);
      }
    });

    it("should resolve xStocks NVDA contract address", () => {
      const xstocksContract = "0xc845b2894dbddd03858fd2d643b4ef725fe0849d";
      const result = lookupByContract(xstocksContract);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.underlying.ticker).toBe("NVDA");
        expect(result.matchedRepresentation.providerId).toBe("xstocks");
        expect(result.matchedRepresentation.tokenSymbol).toBe("NVDAx");
        expect(result.matchedRepresentation.contractAddress).toBe(xstocksContract);
      }
    });

    it("should normalize mixed-case contract input", () => {
      const mixedCase = "0xA9EE28c80f960B889dfbd1902055218cba016F75";
      const result = lookupByContract(mixedCase);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.normalizedAddress).toBe("0xa9ee28c80f960b889dfbd1902055218cba016f75");
        expect(result.matchedRepresentation.tokenSymbol).toBe("NVDAon");
      }
    });

    it("should return clean typed error for unknown contract address", () => {
      const unknownAddr = "0x0000000000000000000000000000000000001234";
      const result = lookupByContract(unknownAddr);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe("CONTRACT_NOT_FOUND");
      }
    });

    it("should return clean typed error for invalid contract address format", () => {
      const result = lookupByContract("not-a-valid-hex-address");
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error).toBe("INVALID_ADDRESS");
      }
    });
  });

  describe("3. Provider and Issuer Identity", () => {
    it("should correctly identify all provider names and legal issuers for NVDA", () => {
      const result = lookupByTicker("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        const ondo = result.representations.find((r) => r.providerId === "ondo");
        const bstocks = result.representations.find((r) => r.providerId === "bstocks");
        const xstocks = result.representations.find((r) => r.providerId === "xstocks");

        expect(ondo?.issuer).toBe("Ondo Global Markets / Ondo Finance");
        expect(bstocks?.issuer).toBe("BTech Holdings Limited (Binance Affiliate)");
        expect(xstocks?.issuer).toBe("Backed Assets (JE) Limited (acquired by Kraken)");
      }
    });
  });

  describe("4. Economic & Corporate-Action Mechanism Distinction & Data Integrity", () => {
    it("should preserve distinct economic mechanisms without flattening into identical models", () => {
      const result = lookupByTicker("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        const ondo = result.representations.find((r) => r.providerId === "ondo");
        const bstocks = result.representations.find((r) => r.providerId === "bstocks");
        const xstocks = result.representations.find((r) => r.providerId === "xstocks");

        // Ondo must be auto_drip_scaled
        expect(ondo?.economicModel.mechanism).toBe("auto_drip_scaled");
        if (ondo?.economicModel.mechanism === "auto_drip_scaled") {
          expect(ondo.economicModel.scaledUiEnabled).toBe(true);
          expect(ondo.economicModel.tokenPriceTracksNav).toBe(true);
        }

        // bStocks must be multiplier
        expect(bstocks?.economicModel.mechanism).toBe("multiplier");
        if (bstocks?.economicModel.mechanism === "multiplier") {
          expect(bstocks.economicModel.formula).toContain("raw_token_balance * multiplier");
          // DATA INTEGRITY: currentMultiplier must be undefined if not polled live (never fake 1.0)
          expect(bstocks.economicModel.currentMultiplier).toBeUndefined();
        }

        // xStocks must be redemption_rate
        expect(xstocks?.economicModel.mechanism).toBe("redemption_rate");
        if (xstocks?.economicModel.mechanism === "redemption_rate") {
          // DATA INTEGRITY: currentRate must be undefined if not polled live (never fake 1.0)
          expect(xstocks.economicModel.currentRate).toBeUndefined();
          expect(xstocks.economicModel.rateFeedSymbol).toBe("Crypto.NVDAX/NVDA.RR");
        }
      }
    });
  });

  describe("5. Evidence & Provenance", () => {
    it("should attach high-confidence provenance records to underlying equity and representations", () => {
      const result = lookupByTicker("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        // Underlying equity provenance
        expect(result.underlying.provenance.sourceClass).toBe("ORACLE");
        expect(result.underlying.provenance.confidence).toBe("HIGH");

        // Representations provenance
        for (const rep of result.representations) {
          expect(rep.provenance.sourceClass).toBe("ON_CHAIN");
          expect(rep.provenance.confidence).toBe("HIGH");
          expect(rep.economicModel.provenance.sourceClass).toBe("FIRST_PARTY");
        }
      }
    });
  });

  describe("6. Registry Integrity & Scope Audit", () => {
    it("should NOT leak unverified bStocks AAPL/TSLA or xStocks AAPL/TSLA candidate contracts into registry", () => {
      const aaplResult = lookupByTicker("AAPL");
      expect(aaplResult.success).toBe(true);
      if (aaplResult.success) {
        expect(aaplResult.representations.length).toBe(1);
        expect(aaplResult.representations[0].providerId).toBe("ondo");
        expect(aaplResult.representations[0].tokenSymbol).toBe("AAPLon");
      }

      const tslaResult = lookupByTicker("TSLA");
      expect(tslaResult.success).toBe(true);
      if (tslaResult.success) {
        expect(tslaResult.representations.length).toBe(1);
        expect(tslaResult.representations[0].providerId).toBe("ondo");
        expect(tslaResult.representations[0].tokenSymbol).toBe("TSLAon");
      }

      const unverifiedBStocksAAPL = "0x1535492d5395A377aCd5386a51272C151A67a4e6";
      const unverifiedBStocksTSLA = "0x256CebE4cfA2576bA1aC26D68d7Fe2E7284fB144";

      expect(lookupByContract(unverifiedBStocksAAPL).success).toBe(false);
      expect(lookupByContract(unverifiedBStocksTSLA).success).toBe(false);
    });

    it("should return correct list of supported tickers", () => {
      const tickers = rwaLens.getSupportedTickers();
      expect(tickers).toEqual(["NVDA", "AAPL", "TSLA"]);
    });

    it("should return only 5 verified contract addresses in total", () => {
      const contracts = rwaLens.getSupportedContracts();
      expect(contracts.length).toBe(5);
    });
  });
});
