import { describe, it, expect } from "vitest";
import { isValidEvmAddress } from "../src/hooks/useStockDna";
import { lookupByTicker, lookupByContract } from "../src/lens/engine";

describe("StockDNA Frontend UI Integration & Validation", () => {
  describe("1. Query Format Auto-Detection", () => {
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
    it("should supply all necessary UI fields for NVDA representations", () => {
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
});
