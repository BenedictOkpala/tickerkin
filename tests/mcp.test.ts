import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { defaultBinanceClient } from "../src/providers/binance";
import {
  handleResolveEquity,
  handleResolveContract,
  handleCompareRepresentations,
  handleGetEvidence,
  handleListEquities,
  createRwaLensMcpServer,
} from "../src/mcp";

describe("Phase 7A RWA Lens Model Context Protocol (MCP) Interface", () => {
  beforeEach(() => {
    defaultBinanceClient.clearCache();
    defaultBinanceClient.setFetchFn(
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          code: "000000",
          data: [],
        }),
      }) as unknown as typeof fetch
    );
  });

  afterEach(() => {
    defaultBinanceClient.clearCache();
    defaultBinanceClient.setFetchFn(undefined);
  });

  describe("1. resolve_equity Tool", () => {
    it("should resolve NVDA with 3 verified representations and human-readable models", async () => {
      const res = await handleResolveEquity({ ticker: "NVDA" });
      if (!res.success) {
        expect(res.success).toBe(true);
        return;
      }

      expect(res.underlying.ticker).toBe("NVDA");
      expect(res.underlying.name).toBe("NVIDIA Corporation");
      expect(res.representationsCount).toBe(3);
      expect(res.chain).toBe("BNB Smart Chain");
      expect(res.chainId).toBe(56);

      const ondo = res.representations.find((r) => r.providerId === "ondo");
      const bstocks = res.representations.find((r) => r.providerId === "bstocks");
      const xstocks = res.representations.find((r) => r.providerId === "xstocks");

      expect(ondo).toBeDefined();
      expect(ondo?.symbol).toBe("NVDAon");
      expect(ondo?.economicModel.label).toBe("Auto-DRIP (Scaled UI)");
      expect(ondo?.economicModel.dividendHandling).toBe("Automatic Dividend Reinvestment (DRIP)");
      expect(ondo?.evidence.length).toBeGreaterThanOrEqual(4);

      expect(bstocks).toBeDefined();
      expect(bstocks?.symbol).toBe("NVDAB");
      expect(bstocks?.economicModel.label).toBe("Multiplier Model");

      expect(xstocks).toBeDefined();
      expect(xstocks?.symbol).toBe("NVDAx");
      expect(xstocks?.economicModel.label).toBe("Redemption-Rate Model");
    });

    it("should resolve AAPL and TSLA with 1 representation each", async () => {
      const resAapl = await handleResolveEquity({ ticker: "AAPL" });
      if (!resAapl.success) {
        expect(resAapl.success).toBe(true);
        return;
      }
      expect(resAapl.underlying.ticker).toBe("AAPL");
      expect(resAapl.representationsCount).toBe(1);
      expect(resAapl.representations[0].symbol).toBe("AAPLon");

      const resTsla = await handleResolveEquity({ ticker: "TSLA" });
      if (!resTsla.success) {
        expect(resTsla.success).toBe(true);
        return;
      }
      expect(resTsla.underlying.ticker).toBe("TSLA");
      expect(resTsla.representationsCount).toBe(1);
      expect(resTsla.representations[0].symbol).toBe("TSLAon");
    });

    it("should handle lowercase ticker queries seamlessly", async () => {
      const res = await handleResolveEquity({ ticker: "nvda" });
      if (!res.success) {
        expect(res.success).toBe(true);
        return;
      }
      expect(res.underlying.ticker).toBe("NVDA");
    });

    it("should return clean typed error for unsupported tickers", async () => {
      const res = await handleResolveEquity({ ticker: "UNKNOWN_EQUITY" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe("TICKER_NOT_FOUND");
        expect(res.message).toContain("UNKNOWN_EQUITY");
      }
    });
  });

  describe("2. resolve_contract Tool", () => {
    it("should resolve Ondo NVDA BSC contract address", async () => {
      const contract = "0xa9ee28c80f960b889dfbd1902055218cba016f75";
      const res = await handleResolveContract({ contractAddress: contract });
      if (!res.success) {
        expect(res.success).toBe(true);
        return;
      }

      expect(res.underlying.ticker).toBe("NVDA");
      expect(res.matchedRepresentation.symbol).toBe("NVDAon");
      expect(res.matchedRepresentation.providerId).toBe("ondo");
      expect(res.matchedRepresentation.economicModel.label).toBe("Auto-DRIP (Scaled UI)");
    });

    it("should normalize mixed-case EVM contract input", async () => {
      const mixedCase = "0xA9EE28c80f960B889dfbd1902055218cba016F75";
      const res = await handleResolveContract({ contractAddress: mixedCase });
      if (!res.success) {
        expect(res.success).toBe(true);
        return;
      }

      expect(res.normalizedAddress).toBe("0xa9ee28c80f960b889dfbd1902055218cba016f75");
      expect(res.matchedRepresentation.symbol).toBe("NVDAon");
    });

    it("should return clean error for unregistered BSC contract", async () => {
      const unreg = "0x000000000000000000000000000000000000dead";
      const res = await handleResolveContract({ contractAddress: unreg });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe("CONTRACT_NOT_FOUND");
      }
    });
  });

  describe("3. compare_representations Tool", () => {
    it("should return structured comparison dimensions and difference guide for NVDA", async () => {
      const res = await handleCompareRepresentations({ ticker: "NVDA" });
      if (!res.success) {
        expect(res.success).toBe(true);
        return;
      }

      expect(res.underlying.ticker).toBe("NVDA");
      expect(res.comparisonDimensions.length).toBe(3);

      const ondoDim = res.comparisonDimensions.find((d) => d.providerId === "ondo");
      expect(ondoDim?.economicMechanism.label).toBe("Auto-DRIP (Scaled UI)");
      expect(ondoDim?.dividendHandling).toBe("Automatic Dividend Reinvestment (DRIP)");

      const bstocksDim = res.comparisonDimensions.find((d) => d.providerId === "bstocks");
      expect(bstocksDim?.economicMechanism.label).toBe("Multiplier Model");

      const xstocksDim = res.comparisonDimensions.find((d) => d.providerId === "xstocks");
      expect(xstocksDim?.economicMechanism.label).toBe("Redemption-Rate Model");

      expect(res.mechanismDifferencesGuide.length).toBe(3);
      expect(res.safetyNotice).toContain("does not provide investment advice");
    });

    it("should return clean error for unknown ticker", async () => {
      const res = await handleCompareRepresentations({ ticker: "UNKNOWN" });
      expect(res.success).toBe(false);
    });
  });

  describe("4. get_evidence Tool", () => {
    it("should return claim-scoped evidence for all NVDA representations when unfiltered", async () => {
      const res = await handleGetEvidence({ ticker: "NVDA" });
      if (!res.success) {
        expect(res.success).toBe(true);
        return;
      }

      expect(res.underlying.benchmarkEvidence.sourceClass).toBe("ORACLE");
      expect(res.representationsEvidence.length).toBe(3);

      for (const repEv of res.representationsEvidence) {
        expect(repEv.claims.length).toBeGreaterThanOrEqual(4);
        const identityClaim = repEv.claims.find((c) => c.claimType === "TOKEN_IDENTITY");
        expect(identityClaim?.sourceClass).toBe("ON_CHAIN");
        expect(identityClaim?.confidence).toBe("HIGH");
      }
    });

    it("should filter representations when providerId is specified", async () => {
      const res = await handleGetEvidence({ ticker: "NVDA", providerId: "ondo" });
      if (!res.success) {
        expect(res.success).toBe(true);
        return;
      }

      expect(res.representationsEvidence.length).toBe(1);
      expect(res.representationsEvidence[0].providerId).toBe("ondo");
      expect(res.representationsEvidence[0].tokenSymbol).toBe("NVDAon");
    });

    it("should return error when providerId is not valid for that equity", async () => {
      const res = await handleGetEvidence({ ticker: "AAPL", providerId: "bstocks" });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error).toBe("PROVIDER_REPRESENTATION_NOT_FOUND");
      }
    });
  });

  describe("5. list_equities Tool", () => {
    it("should return curated equities catalog on BSC with explicit scope", async () => {
      const res = await handleListEquities();
      expect(res.success).toBe(true);
      expect(res.totalIndexedEquities).toBe(3);

      const tickers = res.equities.map((e) => e.ticker);
      expect(tickers).toContain("NVDA");
      expect(tickers).toContain("AAPL");
      expect(tickers).toContain("TSLA");

      expect(res.catalogScope).toContain("BNB Smart Chain");
      expect(res.boundaryNotice).toContain("curated and evidence-audited set");
    });
  });

  describe("6. McpServer Factory & Tool Registration", () => {
    it("should create McpServer instance cleanly without errors", () => {
      const server = createRwaLensMcpServer();
      expect(server).toBeDefined();
    });
  });
});
