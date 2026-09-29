import { describe, it, expect } from "vitest";
import { getEquitiesCatalog, getProvidersCatalog, lookupByTicker } from "../src/lens/engine";

describe("TickerKin Explorer Architecture & Catalogs", () => {
  describe("1. Equities Catalog Discovery", () => {
    it("should return a non-empty list of verified equities", () => {
      const catalog = getEquitiesCatalog();
      expect(catalog.length).toBeGreaterThanOrEqual(3);

      const nvda = catalog.find((e) => e.ticker === "NVDA");
      expect(nvda).toBeDefined();
      expect(nvda?.name).toBe("NVIDIA Corporation");
      expect(nvda?.representationCount).toBe(3);
      expect(nvda?.providerIds).toContain("ondo");
      expect(nvda?.providerIds).toContain("bstocks");
      expect(nvda?.providerIds).toContain("xstocks");
      expect(nvda?.chain).toBe("BNB Smart Chain");
    });

    it("should include AAPL and TSLA with accurate representation counts", () => {
      const catalog = getEquitiesCatalog();
      const aapl = catalog.find((e) => e.ticker === "AAPL");
      const tsla = catalog.find((e) => e.ticker === "TSLA");

      expect(aapl).toBeDefined();
      expect(aapl?.representationCount).toBe(1);
      expect(aapl?.providerIds).toEqual(["ondo"]);

      expect(tsla).toBeDefined();
      expect(tsla?.representationCount).toBe(1);
      expect(tsla?.providerIds).toEqual(["ondo"]);
    });

    it("should provide consistent data matching lookupByTicker", () => {
      const catalog = getEquitiesCatalog();
      for (const item of catalog) {
        const lookup = lookupByTicker(item.ticker);
        expect(lookup.success).toBe(true);
        if (lookup.success) {
          expect(lookup.underlying.name).toBe(item.name);
          expect(lookup.representations.length).toBe(item.representationCount);
        }
      }
    });
  });

  describe("2. Providers Catalog Discovery", () => {
    it("should return all verified tokenization providers", () => {
      const providers = getProvidersCatalog();
      expect(providers.length).toBe(3);

      const providerIds = providers.map((p) => p.id);
      expect(providerIds).toContain("ondo");
      expect(providerIds).toContain("bstocks");
      expect(providerIds).toContain("xstocks");
    });

    it("should correctly count representations per provider", () => {
      const providers = getProvidersCatalog();

      const ondo = providers.find((p) => p.id === "ondo");
      expect(ondo).toBeDefined();
      expect(ondo?.name).toBe("Ondo Finance");
      expect(ondo?.verifiedRepresentationCount).toBe(3);
      expect(ondo?.supportedTickers).toContain("NVDA");
      expect(ondo?.supportedTickers).toContain("AAPL");
      expect(ondo?.supportedTickers).toContain("TSLA");

      const bstocks = providers.find((p) => p.id === "bstocks");
      expect(bstocks).toBeDefined();
      expect(bstocks?.verifiedRepresentationCount).toBe(1);
      expect(bstocks?.supportedTickers).toContain("NVDA");

      const xstocks = providers.find((p) => p.id === "xstocks");
      expect(xstocks).toBeDefined();
      expect(xstocks?.verifiedRepresentationCount).toBe(1);
      expect(xstocks?.supportedTickers).toContain("NVDA");
    });

    it("should include valid mechanism and issuer descriptors for each provider", () => {
      const providers = getProvidersCatalog();
      for (const p of providers) {
        expect(p.economicMechanism.length).toBeGreaterThan(5);
        expect(p.issuer.length).toBeGreaterThan(3);
        expect(p.supportedTickers.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("3. Multi-Tab Route Resolution Integrity", () => {
    it("should resolve NVDA for all sub-views without throwing", () => {
      const lookup = lookupByTicker("NVDA");
      expect(lookup.success).toBe(true);

      if (lookup.success) {
        // Overview requirements
        expect(lookup.underlying.ticker).toBe("NVDA");
        expect(lookup.representations.length).toBe(3);

        // Kin Map requirements
        expect(lookup.representations.every((r) => r.contractAddress.startsWith("0x"))).toBe(true);
        expect(lookup.representations.every((r) => r.economicModel !== undefined)).toBe(true);

        // Compare Matrix & Evidence requirements
        for (const rep of lookup.representations) {
          expect(rep.issuer).toBeDefined();
          expect(rep.economicModel.mechanism).toBeDefined();
          expect(rep.provenance).toBeDefined();
          expect(rep.provenance.sourceClass).toBeDefined();
          expect(rep.tokenStandard).toBe("BEP-20");
        }
      }
    });
  });
});
