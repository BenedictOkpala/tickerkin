import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { GET as getDiscovery } from "../src/app/api/lens/route";
import { GET as getTicker } from "../src/app/api/lens/ticker/[ticker]/route";
import { GET as getContract } from "../src/app/api/lens/contract/[address]/route";
import { defaultBinanceClient } from "../src/providers/binance";

describe("RWA Lens Public HTTP API", () => {
  const originalFetch = globalThis.fetch;

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
  describe("1. Root Discovery Endpoint (GET /api/lens)", () => {
    it("should return service metadata, supported providers, and supported tickers", async () => {
      const response = await getDiscovery();
      expect(response.status).toBe(200);

      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.data.service).toBe("RWA Lens");
      expect(json.data.chain).toBe("BNB Smart Chain");
      expect(json.data.chainId).toBe(56);
      expect(json.data.supportedTickers).toEqual(["NVDA", "AAPL", "TSLA"]);
      expect(json.data.totalVerifiedContracts).toBe(5);
      expect(json.data.supportedProviders.length).toBe(3);
    });
  });

  describe("2. Ticker Lookup Endpoint (GET /api/lens/ticker/[ticker])", () => {
    it("should return 200 OK with all 3 representations for NVDA", async () => {
      const req = new Request("http://localhost/api/lens/ticker/NVDA");
      const response = await getTicker(req, {
        params: Promise.resolve({ ticker: "NVDA" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();

      expect(json.ok).toBe(true);
      expect(json.data.query).toBe("NVDA");
      expect(json.data.underlying.ticker).toBe("NVDA");
      expect(json.data.underlying.name).toBe("NVIDIA Corporation");
      expect(json.data.representations.length).toBe(3);

      const providerIds = json.data.representations.map((r: { providerId: string }) => r.providerId);
      expect(providerIds).toContain("ondo");
      expect(providerIds).toContain("bstocks");
      expect(providerIds).toContain("xstocks");
    });

    it("should handle lowercase 'nvda' case-insensitively with 200 OK", async () => {
      const req = new Request("http://localhost/api/lens/ticker/nvda");
      const response = await getTicker(req, {
        params: Promise.resolve({ ticker: "nvda" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.data.underlying.ticker).toBe("NVDA");
    });

    it("should return verified data for AAPL", async () => {
      const req = new Request("http://localhost/api/lens/ticker/AAPL");
      const response = await getTicker(req, {
        params: Promise.resolve({ ticker: "AAPL" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.data.underlying.ticker).toBe("AAPL");
      expect(json.data.representations.length).toBe(1);
      expect(json.data.representations[0].tokenSymbol).toBe("AAPLon");
    });

    it("should return 404 Not Found for unsupported ticker", async () => {
      const req = new Request("http://localhost/api/lens/ticker/DOESNOTEXIST");
      const response = await getTicker(req, {
        params: Promise.resolve({ ticker: "DOESNOTEXIST" }),
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.ok).toBe(false);
      expect(json.error.code).toBe("TICKER_NOT_FOUND");
    });
  });

  describe("3. Contract Reverse Lookup Endpoint (GET /api/lens/contract/[address])", () => {
    it("should resolve known Ondo NVDA contract with 200 OK", async () => {
      const ondoAddr = "0xa9ee28c80f960b889dfbd1902055218cba016f75";
      const req = new Request(`http://localhost/api/lens/contract/${ondoAddr}`);
      const response = await getContract(req, {
        params: Promise.resolve({ address: ondoAddr }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.data.underlying.ticker).toBe("NVDA");
      expect(json.data.matchedRepresentation.tokenSymbol).toBe("NVDAon");
      expect(json.data.matchedRepresentation.providerId).toBe("ondo");
    });

    it("should resolve known bStocks NVDA contract with 200 OK", async () => {
      const bstocksAddr = "0x02fca66c1d1afb4e2a7884261eb00f63598a7436";
      const req = new Request(`http://localhost/api/lens/contract/${bstocksAddr}`);
      const response = await getContract(req, {
        params: Promise.resolve({ address: bstocksAddr }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.data.underlying.ticker).toBe("NVDA");
      expect(json.data.matchedRepresentation.tokenSymbol).toBe("NVDAB");
      expect(json.data.matchedRepresentation.providerId).toBe("bstocks");
    });

    it("should resolve known xStocks NVDA contract with 200 OK", async () => {
      const xstocksAddr = "0xc845b2894dbddd03858fd2d643b4ef725fe0849d";
      const req = new Request(`http://localhost/api/lens/contract/${xstocksAddr}`);
      const response = await getContract(req, {
        params: Promise.resolve({ address: xstocksAddr }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.data.underlying.ticker).toBe("NVDA");
      expect(json.data.matchedRepresentation.tokenSymbol).toBe("NVDAx");
      expect(json.data.matchedRepresentation.providerId).toBe("xstocks");
    });

    it("should return 404 Not Found for unknown valid-format contract address", async () => {
      const unknownAddr = "0x0000000000000000000000000000000000001234";
      const req = new Request(`http://localhost/api/lens/contract/${unknownAddr}`);
      const response = await getContract(req, {
        params: Promise.resolve({ address: unknownAddr }),
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.ok).toBe(false);
      expect(json.error.code).toBe("CONTRACT_NOT_FOUND");
    });

    it("should return 400 Bad Request for malformed contract address", async () => {
      const malformed = "not-a-valid-hex-address";
      const req = new Request(`http://localhost/api/lens/contract/${malformed}`);
      const response = await getContract(req, {
        params: Promise.resolve({ address: malformed }),
      });

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.ok).toBe(false);
      expect(json.error.code).toBe("INVALID_ADDRESS");
    });
  });

  describe("4. Serialization, Provenance & Data Integrity", () => {
    it("should preserve provenance and economic models without injecting fake defaults in JSON", async () => {
      const req = new Request("http://localhost/api/lens/ticker/NVDA");
      const response = await getTicker(req, {
        params: Promise.resolve({ ticker: "NVDA" }),
      });

      const json = await response.json();
      expect(json.ok).toBe(true);

      // Provenance survives serialization
      expect(json.data.underlying.provenance.sourceClass).toBe("ORACLE");
      expect(json.data.underlying.provenance.confidence).toBe("HIGH");

      const ondo = json.data.representations.find((r: { providerId: string }) => r.providerId === "ondo");
      const bstocks = json.data.representations.find((r: { providerId: string }) => r.providerId === "bstocks");
      const xstocks = json.data.representations.find((r: { providerId: string }) => r.providerId === "xstocks");

      expect(ondo.economicModel.mechanism).toBe("auto_drip_scaled");
      expect(bstocks.economicModel.mechanism).toBe("multiplier");
      expect(xstocks.economicModel.mechanism).toBe("redemption_rate");

      // Dynamic values must NOT be fabricated as 1.0
      expect(bstocks.economicModel.currentMultiplier).toBeUndefined();
      expect(xstocks.economicModel.currentRate).toBeUndefined();
      expect(bstocks.economicModel.withholdingTaxRate).toBeUndefined();
    });

    it("should include liveEnrichment in API response when verified live data is available", async () => {
      defaultBinanceClient.clearCache();
      defaultBinanceClient.setFetchFn(
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            code: "000000",
            data: [
              {
                chainId: "56",
                contractAddress: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
                symbol: "NVDAB",
                ticker: "NVDA",
                type: 3,
                assetType: 1,
                multiplier: "1.000778223752807865",
                cs: "NVDABUSDT",
                lastUpdateTime: 1789012513889,
                d: 18,
              },
            ],
          }),
        }) as unknown as typeof fetch
      );

      const req = new Request("http://localhost/api/lens/ticker/NVDA");
      const response = await getTicker(req, {
        params: Promise.resolve({ ticker: "NVDA" }),
      });

      const json = await response.json();
      expect(json.ok).toBe(true);

      const bstocks = json.data.representations.find((r: { providerId: string }) => r.providerId === "bstocks");
      expect(bstocks.liveEnrichment).toBeDefined();
      expect(bstocks.liveEnrichment.rawMultiplier).toBe("1.000778223752807865");
      expect(bstocks.economicModel.currentMultiplier).toBeCloseTo(1.000778, 5);
      expect(["BNB Smart Chain (eth_call multiplier())", "Binance Web3 RWA Data"]).toContain(
        bstocks.liveEnrichment.provenance.sourceName
      );
    });

    it("should set proper caching headers on successful responses", async () => {
      const response = await getDiscovery();
      const cacheHeader = response.headers.get("Cache-Control");
      expect(cacheHeader).toContain("public");
      expect(cacheHeader).toContain("max-age=3600");
    });
  });

  describe("5. Comparison Matrix Endpoint (GET /api/lens/ticker/[ticker]/comparison)", () => {
    it("should return 200 OK with full comparison matrix for NVDA", async () => {
      defaultBinanceClient.clearCache();
      defaultBinanceClient.setFetchFn(
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({
            code: "000000",
            data: [
              {
                chainId: "56",
                contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
                symbol: "NVDAon",
                ticker: "NVDA",
                type: 1,
                assetType: 1,
                multiplier: "1.0017152487959898",
                lastUpdateTime: 1788998689203,
                d: 18,
              },
            ],
          }),
        }) as unknown as typeof fetch
      );

      const { GET: getComparison } = await import("../src/app/api/lens/ticker/[ticker]/comparison/route");
      const req = new Request("http://localhost/api/lens/ticker/NVDA/comparison");
      const response = await getComparison(req, {
        params: Promise.resolve({ ticker: "NVDA" }),
      });

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.ok).toBe(true);
      expect(json.data.underlying.ticker).toBe("NVDA");
      expect(json.data.underlying.referencePriceUSD).toBe(224.15);
      expect(json.data.representations).toHaveLength(3);

      const ondo = json.data.representations.find((r: { providerId: string }) => r.providerId === "ondo");
      const xstocks = json.data.representations.find((r: { providerId: string }) => r.providerId === "xstocks");

      expect(ondo.normalizationStatus).toBe("AVAILABLE");
      expect(xstocks.normalizationStatus).toBe("UNAVAILABLE");
      expect(xstocks.accountingFactor).toBeNull();
    });

    it("should return 404 for unknown ticker comparison", async () => {
      const { GET: getComparison } = await import("../src/app/api/lens/ticker/[ticker]/comparison/route");
      const req = new Request("http://localhost/api/lens/ticker/UNKNOWN/comparison");
      const response = await getComparison(req, {
        params: Promise.resolve({ ticker: "UNKNOWN" }),
      });

      expect(response.status).toBe(404);
      const json = await response.json();
      expect(json.ok).toBe(false);
      expect(json.error.code).toBe("TICKER_NOT_FOUND");
    });
  });
});

