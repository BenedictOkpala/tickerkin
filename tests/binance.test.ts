import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  BinanceRwaClient,
  isValidBinanceStockRecord,
} from "../src/providers/binance/client";
import {
  matchRepresentationIdentity,
  findMatchingBinanceRecord,
  mapBinanceTypeToProviderId,
} from "../src/providers/binance/matcher";
import { BinanceRwaAdapter } from "../src/providers/binance/adapter";
import { RWALensEngine } from "../src/lens/engine";
import { VERIFIED_REGISTRY } from "../src/lens/registry";
import type { BinanceRawStockRecord } from "../src/types/binance";
import type { TokenizedRepresentation } from "../src/types/token";

// Real fixtures extracted from data/raw/binance/nvda-findings.json
const MOCK_ONDO_BSC_RECORD: BinanceRawStockRecord = {
  chainId: "56",
  contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
  symbol: "NVDAon",
  ticker: "NVDA",
  type: 1,
  assetType: 1,
  multiplier: "1.0017152487959898",
  lastUpdateTime: 1788998689203,
  d: 18,
};

const MOCK_BSTOCKS_BSC_RECORD: BinanceRawStockRecord = {
  chainId: "56",
  contractAddress: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
  symbol: "NVDAB",
  ticker: "NVDA",
  type: 3,
  assetType: 1,
  multiplier: "1.000778223752807865",
  cs: "NVDABUSDT",
  asset: "NVDAB",
  lastUpdateTime: 1789012513889,
  d: 18,
};

const MOCK_XSTOCKS_SOLANA_RECORD: BinanceRawStockRecord = {
  chainId: "CT_501",
  contractAddress: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
  symbol: "NVDAx",
  ticker: "NVDA",
  type: 2,
  assetType: 1,
  multiplier: "1.001701196801074",
  lastUpdateTime: 1789000204896,
  d: 8,
};

const MOCK_RECORDS = [
  MOCK_ONDO_BSC_RECORD,
  MOCK_BSTOCKS_BSC_RECORD,
  MOCK_XSTOCKS_SOLANA_RECORD,
];

describe("Binance Web3 RWA Live Data Adapter", () => {
  describe("1. Client & Response Validation", () => {
    it("should validate well-formed Binance stock records", () => {
      expect(isValidBinanceStockRecord(MOCK_ONDO_BSC_RECORD)).toBe(true);
      expect(isValidBinanceStockRecord(MOCK_BSTOCKS_BSC_RECORD)).toBe(true);
      expect(isValidBinanceStockRecord(MOCK_XSTOCKS_SOLANA_RECORD)).toBe(true);
    });

    it("should reject malformed raw records", () => {
      expect(isValidBinanceStockRecord(null)).toBe(false);
      expect(isValidBinanceStockRecord({})).toBe(false);
      expect(isValidBinanceStockRecord({ ticker: "NVDA" })).toBe(false);
      expect(isValidBinanceStockRecord({ ...MOCK_ONDO_BSC_RECORD, multiplier: 123 })).toBe(false);
    });

    it("should successfully fetch and parse mock API response", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          message: null,
          data: [MOCK_BSTOCKS_BSC_RECORD],
        }),
      });

      const client = new BinanceRwaClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const records = await client.fetchStocksByType(3);

      expect(records.length).toBe(1);
      expect(records[0].contractAddress).toBe("0x02fca66c1d1afb4e2a7884261eb00f63598a7436");
      expect(records[0].multiplier).toBe("1.000778223752807865");
    });

    it("should gracefully return empty array when API is down or returns non-200", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      });

      const client = new BinanceRwaClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const records = await client.fetchStocksByType(1);

      expect(records).toEqual([]);
    });

    it("should gracefully return empty array when fetch throws network error", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Connection refused"));

      const client = new BinanceRwaClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const records = await client.fetchAllStocks();

      expect(records).toEqual([]);
    });

    it("should cache successful responses within TTL", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          data: [MOCK_ONDO_BSC_RECORD],
        }),
      });

      const client = new BinanceRwaClient({
        fetchFn: mockFetch as unknown as typeof fetch,
        cacheTtlMs: 60_000,
      });

      await client.fetchStocksByType(1);
      await client.fetchStocksByType(1);

      // fetchFn should only have been called once due to caching
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("2. Identity Matcher & Cross-Chain Safety Rules", () => {
    const baselineEngine = new RWALensEngine();
    const nvdaLookup = baselineEngine.lookupByTicker("NVDA");
    if (!nvdaLookup.success) throw new Error("NVDA not found in test");

    const ondoBscRep = nvdaLookup.representations.find((r) => r.providerId === "ondo")!;
    const bstocksBscRep = nvdaLookup.representations.find((r) => r.providerId === "bstocks")!;
    const xstocksBscRep = nvdaLookup.representations.find((r) => r.providerId === "xstocks")!;

    it("should map provider types accurately", () => {
      expect(mapBinanceTypeToProviderId(1)).toBe("ondo");
      expect(mapBinanceTypeToProviderId(2)).toBe("xstocks");
      expect(mapBinanceTypeToProviderId(3)).toBe("bstocks");
      expect(mapBinanceTypeToProviderId(99)).toBeNull();
    });

    it("should match Ondo BSC NVDA with HIGH confidence via case-insensitive EVM address", () => {
      const match = matchRepresentationIdentity(ondoBscRep, "NVDA", MOCK_ONDO_BSC_RECORD);
      expect(match.matched).toBe(true);
      expect(match.confidence).toBe("HIGH");
      expect(match.record?.contractAddress).toBe("0xa9ee28c80f960b889dfbd1902055218cba016f75");
    });

    it("should match bStocks BSC NVDA with HIGH confidence", () => {
      const match = matchRepresentationIdentity(bstocksBscRep, "NVDA", MOCK_BSTOCKS_BSC_RECORD);
      expect(match.matched).toBe(true);
      expect(match.confidence).toBe("HIGH");
      expect(match.record?.contractAddress).toBe("0x02fca66c1d1afb4e2a7884261eb00f63598a7436");
    });

    it("CRITICAL RULE: should REJECT matching Solana xStocks NVDAx record to BSC NVDAx representation", () => {
      // Representation is on BSC (chainId 56, contract 0xc845...), Record is on Solana (chainId CT_501, mint Xsc9qv...)
      const match = matchRepresentationIdentity(xstocksBscRep, "NVDA", MOCK_XSTOCKS_SOLANA_RECORD);
      expect(match.matched).toBe(false);
      expect(match.confidence).toBe("NO_MATCH");
      expect(match.matchBasis).toContain("Chain mismatch");
    });

    it("CRITICAL RULE: should REJECT ticker-only collisions with different contract addresses", () => {
      const spoofRecord: BinanceRawStockRecord = {
        ...MOCK_ONDO_BSC_RECORD,
        contractAddress: "0x1111111111111111111111111111111111111111", // Wrong contract
      };

      const match = matchRepresentationIdentity(ondoBscRep, "NVDA", spoofRecord);
      expect(match.matched).toBe(false);
      expect(match.confidence).toBe("NO_MATCH");
      expect(match.matchBasis).toContain("Contract address mismatch");
    });

    it("CRITICAL RULE: should REJECT records with mismatched provider type", () => {
      // Try to match bStocks record against Ondo representation
      const match = matchRepresentationIdentity(ondoBscRep, "NVDA", MOCK_BSTOCKS_BSC_RECORD);
      expect(match.matched).toBe(false);
      expect(match.confidence).toBe("NO_MATCH");
      expect(match.matchBasis).toContain("Provider type mismatch");
    });

    it("CRITICAL RULE: should REJECT records with non-numeric multiplier", () => {
      const invalidRecord: BinanceRawStockRecord = {
        ...MOCK_BSTOCKS_BSC_RECORD,
        multiplier: "not-a-number",
      };

      const match = matchRepresentationIdentity(bstocksBscRep, "NVDA", invalidRecord);
      expect(match.matched).toBe(false);
      expect(match.confidence).toBe("NO_MATCH");
      expect(match.matchBasis).toContain("Malformed multiplier");
    });
  });

  describe("3. Adapter Transformation & Non-Flattening Economic Models", () => {
    let adapter: BinanceRwaAdapter;

    beforeEach(() => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          data: MOCK_RECORDS,
        }),
      });
      const client = new BinanceRwaClient({ fetchFn: mockFetch as unknown as typeof fetch });
      adapter = new BinanceRwaAdapter({ client });
    });

    it("should enrich bStocks representation with currentMultiplier and liveEnrichment", async () => {
      const baselineEngine = new RWALensEngine();
      const nvda = baselineEngine.lookupByTicker("NVDA");
      if (!nvda.success) throw new Error("NVDA not found");

      const bstocks = nvda.representations.find((r) => r.providerId === "bstocks")!;
      const enriched = await adapter.enrichSingleRepresentationAsync(bstocks, "NVDA");

      expect(enriched.liveEnrichment).toBeDefined();
      expect(enriched.liveEnrichment?.rawMultiplier).toBe("1.000778223752807865");
      expect(enriched.liveEnrichment?.multiplierValue).toBeCloseTo(1.000778, 5);
      expect(enriched.liveEnrichment?.tradingPair).toBe("NVDABUSDT");
      expect(enriched.liveEnrichment?.provenance.sourceName).toBe("Binance Web3 RWA Data");
      expect(enriched.liveEnrichment?.provenance.sourceClass).toBe("THIRD_PARTY");

      // Verify economic model was updated with currentMultiplier while preserving mechanism
      if (enriched.economicModel.mechanism === "multiplier") {
        expect(enriched.economicModel.currentMultiplier).toBeCloseTo(1.000778, 5);
        expect(enriched.economicModel.formula).toBe("effective_balance = raw_token_balance * multiplier");
      } else {
        throw new Error("Wrong economic model mechanism for bStocks");
      }
    });

    it("should enrich Ondo representation with currentScaleFactor while preserving auto_drip_scaled model", async () => {
      const baselineEngine = new RWALensEngine();
      const nvda = baselineEngine.lookupByTicker("NVDA");
      if (!nvda.success) throw new Error("NVDA not found");

      const ondo = nvda.representations.find((r) => r.providerId === "ondo")!;
      const enriched = await adapter.enrichSingleRepresentationAsync(ondo, "NVDA");

      expect(enriched.liveEnrichment).toBeDefined();
      expect(enriched.liveEnrichment?.rawMultiplier).toBe("1.0017152487959898");

      if (enriched.economicModel.mechanism === "auto_drip_scaled") {
        expect(enriched.economicModel.currentScaleFactor).toBeCloseTo(1.001715, 5);
        expect(enriched.economicModel.scaledUiEnabled).toBe(true);
      } else {
        throw new Error("Wrong economic model mechanism for Ondo");
      }
    });

    it("should leave xStocks BSC representation un-enriched when only Solana record is available", async () => {
      const baselineEngine = new RWALensEngine();
      const nvda = baselineEngine.lookupByTicker("NVDA");
      if (!nvda.success) throw new Error("NVDA not found");

      const xstocks = nvda.representations.find((r) => r.providerId === "xstocks")!;
      const enriched = await adapter.enrichSingleRepresentationAsync(xstocks, "NVDA");

      // xStocks BSC representation must remain un-enriched
      expect(enriched.liveEnrichment).toBeUndefined();
      if (enriched.economicModel.mechanism === "redemption_rate") {
        expect(enriched.economicModel.currentRate).toBeUndefined();
      }
    });
  });

  describe("4. RWA Lens Engine Enriched Lookups & Resilience", () => {
    it("should perform async enriched ticker lookup for NVDA", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          data: MOCK_RECORDS,
        }),
      });

      const client = new BinanceRwaClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const adapter = new BinanceRwaAdapter({ client });
      const engine = new RWALensEngine(VERIFIED_REGISTRY, adapter);

      const result = await engine.lookupByTickerAsync("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.representations.length).toBe(3);

        const ondo = result.representations.find((r) => r.providerId === "ondo");
        const bstocks = result.representations.find((r) => r.providerId === "bstocks");
        const xstocks = result.representations.find((r) => r.providerId === "xstocks");

        expect(ondo?.liveEnrichment).toBeDefined();
        expect(bstocks?.liveEnrichment).toBeDefined();
        expect(xstocks?.liveEnrichment).toBeUndefined(); // Safe cross-chain isolation
      }
    });

    it("should perform async enriched contract lookup for bStocks NVDA", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          data: MOCK_RECORDS,
        }),
      });

      const client = new BinanceRwaClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const adapter = new BinanceRwaAdapter({ client });
      const engine = new RWALensEngine(VERIFIED_REGISTRY, adapter);

      const contract = "0x02fca66c1d1afb4e2a7884261eb00f63598a7436";
      const result = await engine.lookupByContractAsync(contract);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.matchedRepresentation.liveEnrichment).toBeDefined();
        expect(result.matchedRepresentation.liveEnrichment?.rawMultiplier).toBe("1.000778223752807865");
      }
    });

    it("RESILIENCE: should seamlessly fall back to static verified registry if Binance is down", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network timeout"));
      const client = new BinanceRwaClient({ fetchFn: mockFetch as unknown as typeof fetch });
      const adapter = new BinanceRwaAdapter({ client });
      const engine = new RWALensEngine(VERIFIED_REGISTRY, adapter);

      const result = await engine.lookupByTickerAsync("NVDA");
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.representations.length).toBe(3);
        // All representations are intact without live enrichment
        expect(result.representations[0].liveEnrichment).toBeUndefined();
        expect(result.representations[1].liveEnrichment).toBeUndefined();
        expect(result.representations[2].liveEnrichment).toBeUndefined();
      }
    });
  });
});
