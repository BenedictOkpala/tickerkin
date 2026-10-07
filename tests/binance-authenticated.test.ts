import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import ts from "typescript";
import { AuthenticatedBinanceWeb3Client, parseSearchResponse } from "@/providers/binance/authenticated-client";
import { AuthenticatedBinanceEnrichmentAdapter, attachSearchMetadata } from "@/providers/binance/authenticated-adapter";
import { BinanceRwaAdapter } from "@/providers/binance/adapter";
import { BinanceRwaClient } from "@/providers/binance/client";
import { parsePositiveDecimal } from "@/providers/binance/numeric";
import { RWALensEngine } from "@/lens/engine";
import { buildEquityComparison } from "@/lens/comparison";
import type { BscMultiplierResult } from "@/providers/bstocks/bsc-rpc";

const time = "2026-10-07T10:00:00.000Z";
const baseline = new RWALensEngine().lookupByTicker("NVDA");
if (!baseline.success) throw new Error("Baseline missing");
const reps = baseline.representations;
const bstock = reps.find(r => r.providerId === "bstocks")!;
const ondo = reps.find(r => r.providerId === "ondo")!;
const asset = { platformId: "bstock", binanceChainId: "56", tokenContractAddress: bstock.contractAddress, tokenSymbol: "NVDAB" };
function envelope(overrides = {}) {
  return { code: 0, success: true, data: [{ ticker: "NVDA", companyName: "NVIDIA", assets: [{ ...asset, ...overrides }] }] };
}
function client(fetchFn: typeof fetch, now = () => new Date(time), cacheTtlMs = 60_000) {
  return new AuthenticatedBinanceWeb3Client({ fetchFn, now, cacheTtlMs });
}
let key: string, secret: string;
beforeEach(() => {
  // Ephemeral synthetic values, never persisted or snapshot-tested.
  key = randomBytes(16).toString("hex"); secret = randomBytes(32).toString("hex");
  vi.stubEnv("BINANCE_WEB3_API_KEY", key); vi.stubEnv("BINANCE_WEB3_SECRET_KEY", secret);
});
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe("Authenticated search transport and security", () => {
  it("signs the exact /build path and encoded query with injected clock and empty GET body", async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify(envelope())));
    const result = await client(fetchFn).search("NVDA & +/?");
    const [url, options] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    const signedPath = "/build/api/v1/dex/market/rwa/search?keyword=NVDA+%26+%2B%2F%3F";
    expect(url).toBe("https://web3.binance.com" + signedPath);
    const headers = options.headers as Record<string, string>;
    expect(headers["X-OC-TIMESTAMP"]).toBe(time);
    expect(headers["X-OC-SIGN"] === createHmac("sha256", secret).update(time + "GET" + signedPath).digest("base64")).toBe(true);
    expect(headers["X-OC-APIKEY"] === key).toBe(true);
    expect(options.body).toBeUndefined();
    expect(options.cache).toBe("no-store");
    expect(options.redirect).toBe("error");
    const serialized = JSON.stringify(result);
    for (const sensitive of [key, secret, headers["X-OC-SIGN"]]) expect(serialized.includes(sensitive)).toBe(false);
    expect(result?.freshness).toBe("SNAPSHOT");
  });
  it.each(["BINANCE_WEB3_API_KEY", "BINANCE_WEB3_SECRET_KEY"])("does not request without %s", async name => {
    vi.stubEnv(name, "");
    const fetchFn = vi.fn();
    expect(await client(fetchFn).search("NVDA")).toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });
  it.each([401, 403, 429, 500, 503])("fails safely on HTTP %i", async status => {
    expect(await client(vi.fn(async () => new Response(null, { status }))).search("NVDA")).toBeNull();
  });
  it("swallows timeout/error details without logging secrets", async () => {
    const log = vi.spyOn(console, "log"), error = vi.spyOn(console, "error"), warn = vi.spyOn(console, "warn");
    expect(await client(vi.fn(async () => { throw new Error(secret + key); })).search("NVDA")).toBeNull();
    expect(log).not.toHaveBeenCalled(); expect(error).not.toHaveBeenCalled(); expect(warn).not.toHaveBeenCalled();
  });
  it.each([{}, { code: "000000", data: [] }, { code: 0, success: true, data: [{}] }, { code: 0, success: true, data: [{ ticker: "NVDA", companyName: "N", assets: [{}] }] }])("rejects incompatible schemas", value => {
    expect(parseSearchResponse(value)).toBeNull();
  });
  it("retains original retrieval time through cache hits and failed refresh", async () => {
    let date = new Date(time);
    const fetchFn = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(envelope()))).mockRejectedValue(new Error("timeout"));
    const transport = client(fetchFn, () => date, 1000);
    const first = await transport.search("NVDA");
    date = new Date(Date.parse(time) + 500);
    const hit = await transport.search("NVDA");
    expect(fetchFn).toHaveBeenCalledTimes(1);
    date = new Date(Date.parse(time) + 2000);
    const stale = await transport.search("NVDA");
    for (const result of [first, hit, stale]) {
      expect(result?.retrievedAt).toBe(time);
      expect(JSON.stringify(result)).not.toContain("observedAt");
    }
    expect(hit?.freshness).toBe("CACHED"); expect(stale?.freshness).toBe("CACHED");
  });
});

describe("Identity and factor integrity", () => {
  it.each(["1.2junk", "NaN", "Infinity", "-1", "0", "", " 1.2", "1e3"])("rejects malformed/nonpositive factor %s", value => {
    expect(parsePositiveDecimal(value)).toBeNull();
  });
  it.each([{ platformId: "xstocks" }, { platformId: "unknown" }, { binanceChainId: "CT_501" }, { binanceChainId: "1" }, { tokenContractAddress: ondo.contractAddress }])("does not match incompatible identity", async overrides => {
    const result = await client(vi.fn(async () => new Response(JSON.stringify(envelope(overrides))))).search("NVDA");
    expect(attachSearchMetadata(bstock, "NVDA", result!).binanceMetadata).toBeUndefined();
  });
  it("requires underlying ticker and rejects ambiguous duplicate candidates", async () => {
    const result = await client(vi.fn(async () => new Response(JSON.stringify(envelope())))).search("NVDA");
    expect(attachSearchMetadata(bstock, "AAPL", result!).binanceMetadata).toBeUndefined();
    expect(attachSearchMetadata(bstock, "NVDA", { ...result!, assets: [...result!.assets, ...result!.assets] }).binanceMetadata).toBeUndefined();
    expect(attachSearchMetadata({ ...bstock, contractAddress: bstock.contractAddress.toUpperCase() }, "nvda", result!).binanceMetadata).toBeDefined();
  });
  it("price-shaped responses cannot create normalization evidence", async () => {
    const transport = client(vi.fn(async () => new Response(JSON.stringify({ code: 0, success: true, data: [{ ...asset, tokenPrice: "200", referencePrice: "100" }] }))));
    expect(await transport.search("NVDA")).toBeNull();
  });
  it("metadata coexists with direct RPC precedence in ticker and contract lookups", async () => {
    const legacy = new BinanceRwaAdapter({ client: new BinanceRwaClient({ fetchFn: vi.fn(async () => new Response(JSON.stringify({
      code: "000000", data: [{ chainId: "56", contractAddress: bstock.contractAddress, symbol: "NVDAB", ticker: "NVDA", type: 3, multiplier: "9.0" }],
    }))) }) });
    const adapter = new AuthenticatedBinanceEnrichmentAdapter(legacy, client(vi.fn(async () => new Response(JSON.stringify(envelope())))));
    const rpc: BscMultiplierResult = { rawMultiplier: "1.25", multiplierValue: 1.25, rawHex: "0x", rpcEndpoint: "https://bsc.publicnode.com", fetchedAt: time };
    const engine = new RWALensEngine(undefined, adapter, async () => rpc, async () => rpc);
    const ticker = await engine.lookupByTickerAsync("NVDA");
    const contract = await engine.lookupByContractAsync(bstock.contractAddress);
    if (!ticker.success || !contract.success) throw new Error("Lookup failed");
    for (const rep of [ticker.representations.find(r => r.providerId === "bstocks")!, contract.matchedRepresentation]) {
      expect(rep.liveEnrichment?.rawMultiplier).toBe("1.25");
      expect(rep.liveEnrichment?.provenance.sourceClass).toBe("ON_CHAIN");
      expect(rep.liveEnrichment?.lastUpdateIso).toBe(time);
      expect(rep.binanceMetadata?.provenance.sourceClass).toBe("THIRD_PARTY");
      expect(["SNAPSHOT", "CACHED"]).toContain(rep.binanceMetadata?.freshness);
      const serialized = JSON.stringify(rep);
      expect(serialized.includes(key)).toBe(false); expect(serialized.includes(secret)).toBe(false);
    }
    const matrix = buildEquityComparison("NVDA", ticker.representations)!;
    expect(matrix.underlying.referenceSource).toContain("Pyth");
    expect(matrix.representations.find(r => r.providerId === "bstocks")?.dataComponents?.referencePrice.status).toBe("SNAPSHOT");
  });
  it("preserves public fallback and baseline if authenticated search fails", async () => {
    const fallback = new BinanceRwaAdapter({ client: new BinanceRwaClient({ fetchFn: vi.fn(async () => { throw new Error("offline"); }) }) });
    const engine = new RWALensEngine(undefined, new AuthenticatedBinanceEnrichmentAdapter(fallback, client(vi.fn(async () => new Response(null, { status: 403 })))), async () => null, async () => null);
    const result = await engine.lookupByTickerAsync("NVDA");
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.representations).toHaveLength(3);
    expect(result.representations.every(r => !r.liveEnrichment)).toBe(true);
  });
});

it("all client component runtime dependency graphs exclude server orchestration and signing", () => {
  function walk(dir: string): string[] { return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(resolve(dir, e.name)) : [resolve(dir, e.name)]); }
  const sources = walk(resolve("src")).filter(p => /\.tsx?$/.test(p));
  const visited = new Set<string>();
  function visit(file: string) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = readFileSync(file, "utf8");
    expect(/BINANCE_WEB3_(API_KEY|SECRET_KEY)|node:crypto|authenticated-client|lookupByTickerAsync/.test(source)).toBe(false);
    const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
    for (const statement of ast.statements) {
      if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue;
      if (ts.isImportDeclaration(statement) && statement.importClause?.isTypeOnly) continue;
      if (ts.isExportDeclaration(statement) && statement.isTypeOnly) continue;
      if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
      const spec = statement.moduleSpecifier.text;
      if (!spec.startsWith(".") && !spec.startsWith("@/")) continue;
      const target = spec.startsWith("@/") ? resolve("src", spec.slice(2)) : resolve(dirname(file), spec);
      const resolved = [target + ".ts", target + ".tsx", resolve(target, "index.ts")].find(existsSync);
      if (resolved) visit(resolved);
    }
  }
  for (const file of sources) if (/["']use client["']/.test(readFileSync(file, "utf8"))) visit(file);
  expect(visited.size).toBeGreaterThan(20);
});

it("timeout abort preserves discovery and does not leak upstream details", async () => {
  const fetchFn = vi.fn((_url: string | URL | Request, options?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    options?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
  }));
  const transport = new AuthenticatedBinanceWeb3Client({ fetchFn, now: () => new Date(time), timeoutMs: 1 });
  expect(await transport.search("NVDA")).toBeNull();
});
it("metadata without any factor leaves normalization unavailable", async () => {
  const fallback = new BinanceRwaAdapter({ client: new BinanceRwaClient({ fetchFn: vi.fn(async () => new Response(JSON.stringify({ code: "000000", data: [] }))) }) });
  const engine = new RWALensEngine(undefined, new AuthenticatedBinanceEnrichmentAdapter(fallback, client(vi.fn(async () => new Response(JSON.stringify(envelope()))))), async () => null, async () => null);
  const result = await engine.lookupByTickerAsync("NVDA");
  if (!result.success) throw new Error("Lookup failed");
  const rep = result.representations.find(r => r.providerId === "bstocks")!;
  expect(rep.binanceMetadata).toBeDefined();
  expect(rep.liveEnrichment).toBeUndefined();
  expect(buildEquityComparison("NVDA", result.representations)!.representations.find(r => r.providerId === "bstocks")!.normalizationStatus).toBe("UNAVAILABLE");
});
it.each([401, 403, 429, 500, 503])("HTTP %i retains matched public factor fallback", async status => {
  const fallback = new BinanceRwaAdapter({ client: new BinanceRwaClient({ fetchFn: vi.fn(async () => new Response(JSON.stringify({
    code: "000000", data: [{ chainId: "56", contractAddress: bstock.contractAddress, symbol: "NVDAB", ticker: "NVDA", type: 3, multiplier: "1.5" }],
  }))) }) });
  const adapter = new AuthenticatedBinanceEnrichmentAdapter(fallback, client(vi.fn(async () => new Response(null, { status }))));
  const rep = await adapter.enrichSingleRepresentationAsync(bstock, "NVDA");
  expect(rep.liveEnrichment?.rawMultiplier).toBe("1.5");
  expect(rep.liveEnrichment?.provenance.sourceName).toBe("Binance Web3 RWA Data");
  expect(rep.binanceMetadata).toBeUndefined();
});
it("xStocks RPC wins conflicting public factor in both lookup paths", async () => {
  const xstock = reps.find(r => r.providerId === "xstocks")!;
  const fallback = new BinanceRwaAdapter({ client: new BinanceRwaClient({ fetchFn: vi.fn(async () => new Response(JSON.stringify({
    code: "000000", data: [{ chainId: "56", contractAddress: xstock.contractAddress, symbol: "NVDAx", ticker: "NVDA", type: 2, multiplier: "9.0" }],
  }))) }) });
  const adapter = new AuthenticatedBinanceEnrichmentAdapter(fallback, client(vi.fn(async () => new Response(JSON.stringify(envelope())))));
  const rpc: BscMultiplierResult = { rawMultiplier: "1.25", multiplierValue: 1.25, rawHex: "0x", rpcEndpoint: "https://bsc.publicnode.com", fetchedAt: time };
  const engine = new RWALensEngine(undefined, adapter, async () => null, async () => rpc);
  const ticker = await engine.lookupByTickerAsync("NVDA"), contract = await engine.lookupByContractAsync(xstock.contractAddress);
  if (!ticker.success || !contract.success) throw new Error("Lookup failed");
  for (const rep of [ticker.representations.find(r => r.providerId === "xstocks")!, contract.matchedRepresentation]) {
    expect(rep.liveEnrichment?.rawMultiplier).toBe("1.25");
    expect(rep.liveEnrichment?.provenance.sourceClass).toBe("ON_CHAIN");
    expect(rep.liveEnrichment?.lastUpdateIso).toBe(time);
  }
});
it("dynamic API caching never uses the static discovery policy", async () => {
  const { GET } = await import("@/app/api/lens/ticker/[ticker]/route");
  const publicClient = (await import("@/providers/binance/client")).defaultBinanceClient;
  publicClient.clearCache();
  publicClient.setFetchFn(vi.fn(async () => new Response(JSON.stringify({ code: "000000", data: [] }))));
  vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 503 })));
  try {
    const response = await GET(new Request("http://localhost/api/lens/ticker/NVDA"), { params: Promise.resolve({ ticker: "NVDA" }) });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const body = JSON.stringify(await response.json());
    expect(body.includes(key)).toBe(false); expect(body.includes(secret)).toBe(false);
  } finally { publicClient.setFetchFn(undefined); publicClient.clearCache(); vi.unstubAllGlobals(); }
});
