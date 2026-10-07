import React from "react";
import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { RWALensEngine } from "@/lens/engine";
import { buildEquityComparison, calculateTokenValue } from "@/lens/comparison";
import { getClaimScopedEvidence } from "@/lens/presentation";
import { getFactorFreshness } from "@/lens/freshness";
import { BinanceRwaClient } from "@/providers/binance/client";
import { BinanceRwaAdapter } from "@/providers/binance/adapter";
import type { BinanceRawStockRecord } from "@/types/binance";
import type { ProviderId } from "@/types/token";
import type { BscMultiplierResult } from "@/providers/bstocks/bsc-rpc";
import { RepresentationCard } from "@/components/stockdna/RepresentationCard";
import { RepresentationDetailDrawer } from "@/components/stockdna/RepresentationDetailDrawer";
import { InteractiveComparison } from "@/components/comparison/InteractiveComparison";
import { TokenValueCalculator } from "@/components/comparison/TokenValueCalculator";

const fetchedAt = "2026-10-07T10:00:00.000Z";
const factorResult: BscMultiplierResult = {
  rawMultiplier: "1.000778223752807865",
  multiplierValue: 1.0007782237528078,
  rawHex: "0x0000000000000000000000000000000000000000000000000de37a7dfdbb85b9",
  rpcEndpoint: "https://bsc.publicnode.com",
  fetchedAt,
};
const records: BinanceRawStockRecord[] = [
  { chainId: "56", contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75", symbol: "NVDAon", ticker: "NVDA", type: 1, multiplier: "1.0017152487959898", lastUpdateTime: 1788998689203 },
  { chainId: "56", contractAddress: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436", symbol: "NVDAB", ticker: "NVDA", type: 3, multiplier: "1.000778223752807865" },
  { chainId: "CT_501", contractAddress: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", symbol: "NVDAx", ticker: "NVDA", type: 2, multiplier: "1.001701196801074" },
];

function clientFor(data: readonly BinanceRawStockRecord[]) {
  return new BinanceRwaClient({
    fetchFn: vi.fn(async () => new Response(JSON.stringify({ code: "000000", data }))),
  });
}

async function lookup(withRpc = true, withBinance = true) {
  const engine = new RWALensEngine(
    undefined,
    new BinanceRwaAdapter({ client: clientFor(withBinance ? records : []) }),
    async () => withRpc ? factorResult : null,
    async () => withRpc ? { ...factorResult, rawMultiplier: "1.001701196801074000", multiplierValue: 1.001701196801074 } : null,
  );
  const result = await engine.lookupByTickerAsync("NVDA");
  if (!result.success) throw new Error(result.message);
  const matrix = buildEquityComparison("NVDA", result.representations)!;
  return { result, matrix };
}

function dynamicClaim(result: Awaited<ReturnType<typeof lookup>>["result"], provider: ProviderId) {
  const rep = result.representations.find((r) => r.providerId === provider)!;
  return getClaimScopedEvidence(rep, result.underlying).find((c) => c.claimType === "DYNAMIC_FACTOR")!;
}

describe("Pre-submission provenance and component freshness integrity", () => {
  it("attributes direct bStocks RPC factor to its actual on-chain source, not Binance", async () => {
    const { result } = await lookup();
    const claim = dynamicClaim(result, "bstocks");
    expect(claim.sourceName).toBe("BNB Smart Chain (eth_call multiplier())");
    expect(claim.sourceClass).toBe("ON_CHAIN");
    expect(claim.sourceRef).toContain("bscscan.com/token/0x02fca");
    expect(claim.sourceLabel).not.toContain("Binance");
    expect(claim.claim).toContain("Live factor");
  });

  it("attributes direct xStocks RPC factor to its actual on-chain source, not Binance", async () => {
    const { result } = await lookup();
    const claim = dynamicClaim(result, "xstocks");
    expect(claim.sourceName).toBe("BNB Smart Chain (eth_call multiplier())");
    expect(claim.sourceRef).toContain("bscscan.com/token/0xc845");
    expect(claim.sourceLabel).not.toContain("Binance");
    expect(claim.sourceClass).toBe("ON_CHAIN");
  });

  it("attributes Binance factor to Binance and conservatively marks its cacheable record cached", async () => {
    const { result, matrix } = await lookup();
    const claim = dynamicClaim(result, "ondo");
    expect(claim.sourceName).toBe("Binance Web3 RWA Data");
    expect(claim.sourceClass).toBe("THIRD_PARTY");
    expect(claim.sourceRef).toContain("binance.com/bapi/");
    expect(claim.claim).toContain("Cached factor");
    expect(matrix.representations[0].dataComponents?.factor.status).toBe("CACHED");
  });

  it("does not infer factor provenance from provider when bStocks falls back to Binance", async () => {
    const { result, matrix } = await lookup(false);
    expect(dynamicClaim(result, "bstocks").sourceName).toBe("Binance Web3 RWA Data");
    const rep = matrix.representations.find((r) => r.providerId === "bstocks")!;
    expect(rep.factorSource).toBe("Binance Web3 RWA Data");
    expect(rep.dataComponents?.factor.status).toBe("CACHED");
  });

  it("keeps direct RPC precedence and rejects the Solana xStocks identity", async () => {
    const { matrix } = await lookup();
    expect(matrix.representations.find((r) => r.providerId === "bstocks")?.factorProvenance?.sourceClass).toBe("ON_CHAIN");
    const fallback = await lookup(false);
    const xstocks = fallback.matrix.representations.find((r) => r.providerId === "xstocks")!;
    expect(xstocks.normalizationStatus).toBe("UNAVAILABLE");
    expect(xstocks.accountingFactor).toBeNull();
    expect(xstocks.factorProvenance).toBeUndefined();
  });

  it("missing factor retains structural evidence without invented dynamic-source provenance", async () => {
    const { result, matrix } = await lookup(false, false);
    for (const rep of matrix.representations) {
      const claim = dynamicClaim(result, rep.providerId);
      expect(claim.title).toBe("Structural Baseline Verification");
      expect(claim.sourceName).toBe("RWA Lens Verified Registry");
      expect(rep.factorProvenance).toBeUndefined();
      expect(rep.dataComponents?.factor).toEqual({ status: "UNAVAILABLE" });
      expect(rep.factorSource).toBeUndefined();
    }
  });

  it("live RPC factor does not make the underlying reference snapshot live", async () => {
    const { matrix } = await lookup();
    const rep = matrix.representations.find((r) => r.providerId === "bstocks")!;
    expect(rep.dataComponents?.factor).toMatchObject({ status: "LIVE", timestamp: fetchedAt });
    expect(matrix.underlying.freshness).toBe("SNAPSHOT");
    expect(rep.dataComponents?.referencePrice).toMatchObject({ status: "SNAPSHOT", timestamp: matrix.underlying.timestamp });
    expect(rep.dataComponents?.referencePrice.timestamp).not.toBe(fetchedAt);
    expect(rep.dataFreshness).toBe("CACHED");
    expect(rep.dataTimestamp).toBe(matrix.underlying.timestamp);
  });

  it("live RPC factor does not make DEX snapshots live or invent their capture timestamp", async () => {
    const { matrix } = await lookup();
    const rep = matrix.representations.find((r) => r.providerId === "bstocks")!;
    expect(rep.dataComponents?.dexPrice.status).toBe("CACHED");
    expect(rep.dataComponents?.dexPrice.source).toContain("GeckoTerminal");
    expect(rep.dataComponents?.dexPrice.sourceRef).toContain("/bsc/pools/");
    expect(rep.dataComponents?.dexPrice.timestamp).toBeUndefined();
    const xstocks = matrix.representations.find((r) => r.providerId === "xstocks")!;
    expect(xstocks.dataComponents?.factor.status).toBe("LIVE");
    expect(xstocks.dataComponents?.dexPrice).toEqual({ status: "UNAVAILABLE" });
  });

  it("calculator retains arithmetic and source provenance while scoping mixed freshness", async () => {
    const { matrix } = await lookup();
    const calc = calculateTokenValue({ ticker: "NVDA", providerId: "bstocks", tokenAmount: 100 }, matrix);
    expect(calc.shareEquivalentAmount).toBeCloseTo(100 * factorResult.multiplierValue, 10);
    expect(calc.totalReferenceValueUSD).toBeCloseTo(100 * factorResult.multiplierValue * 224.15, 8);
    expect(calc.freshness).toBe("CACHED");
    expect(calc.dataComponents?.factor.status).toBe("LIVE");
    expect(calc.dataComponents?.referencePrice.status).toBe("SNAPSHOT");
    expect(calc.provenance.sourceName).toBe(calc.source);
    expect(calc.provenance.sourceClass).toBe("ON_CHAIN");
  });

  it("missing factors keep calculator outputs unavailable without a default 1.0", async () => {
    const { matrix } = await lookup(false, false);
    for (const providerId of ["ondo", "bstocks", "xstocks"] as const) {
      const calc = calculateTokenValue({ ticker: "NVDA", providerId, tokenAmount: 100 }, matrix);
      expect(calc.normalizationStatus).toBe("UNAVAILABLE");
      expect(calc.freshness).toBe("UNAVAILABLE");
      expect(calc.accountingFactor).toBeNull();
      expect(calc.shareEquivalentAmount).toBeNull();
      expect(calc.totalReferenceValueUSD).toBeNull();
      expect(calc.dataComponents?.factor).toEqual({ status: "UNAVAILABLE" });
    }
  });

  it("expired Binance cache retained after failed refresh is never described as live", async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ code: "000000", data: [records[0]] })))
      .mockRejectedValueOnce(new Error("timeout"));
    const client = new BinanceRwaClient({ cacheTtlMs: 0, fetchFn });
    await client.fetchStocksByType(1);
    const retained = await client.fetchStocksByType(1);
    const engine = new RWALensEngine();
    const baseline = engine.lookupByTicker("NVDA");
    if (!baseline.success) throw new Error(baseline.message);
    const enriched = new BinanceRwaAdapter({ client }).enrichRepresentation(baseline.representations[0], "NVDA", retained);
    expect(getFactorFreshness(enriched.liveEnrichment)).toBe("CACHED");
    const claim = getClaimScopedEvidence(enriched, baseline.underlying).find((c) => c.claimType === "DYNAMIC_FACTOR")!;
    expect(claim.claim).toContain("Cached factor");
    expect(claim.claim).not.toContain("Live factor");
  });

  it("renders comparison and calculator with scoped labels and preserved timestamps", async () => {
    const { matrix } = await lookup();
    const comparisonHtml = renderToStaticMarkup(<InteractiveComparison matrix={matrix} />);
    expect(comparisonHtml).toContain("Secondary DEX Spot (Cached)");
    expect(comparisonHtml).toContain("Pyth Oracle Snapshot");
    expect(comparisonHtml).toContain(matrix.underlying.timestamp!);
    expect(comparisonHtml).toContain("Live factor");
    expect(comparisonHtml).toContain("Cached factor");
    expect(comparisonHtml).not.toContain("Live BSC");
    expect(comparisonHtml).not.toContain("Live BNB Chain factor");
    const ondoOnly = { ...matrix, representations: matrix.representations.filter((r) => r.providerId === "ondo") };
    const calculatorHtml = renderToStaticMarkup(<TokenValueCalculator matrix={ondoOnly} />);
    expect(calculatorHtml).toContain("Cached factor");
    expect(calculatorHtml).toContain("Underlying Stock Price (Snapshot)");
    expect(calculatorHtml).not.toContain("VERIFIED LIVE FACTOR");
  });

  it("renders Kin Map cards and comparison evidence details from actual factor metadata", async () => {
    const { result, matrix } = await lookup();
    const ondo = result.representations.find((r) => r.providerId === "ondo")!;
    const cardHtml = renderToStaticMarkup(<RepresentationCard representation={ondo} onInspectEvidence={() => {}} />);
    expect(cardHtml).toContain("Cached factor");
    expect(cardHtml).not.toContain("Binance Web3 Live");
    const baseline = new RWALensEngine().lookupByTicker("NVDA");
    if (!baseline.success) throw new Error(baseline.message);
    const bstocks = baseline.representations.find((r) => r.providerId === "bstocks")!;
    const comparison = matrix.representations.find((r) => r.providerId === "bstocks")!;
    const drawerHtml = renderToStaticMarkup(<RepresentationDetailDrawer representation={bstocks} underlying={result.underlying} comparison={comparison} onClose={() => {}} />);
    expect(drawerHtml).toContain("Live factor");
    expect(drawerHtml).toContain("BNB Smart Chain (eth_call multiplier())");
    expect(drawerHtml).not.toContain("Binance Web3 RWA Data Service");
    expect(drawerHtml).not.toContain("Live factor not available (Static baseline)");
  });

  it("legacy LIVE aggregate payload cannot make a snapshot-based calculation LIVE", async () => {
    const { matrix } = await lookup();
    const legacy = { ...matrix, representations: matrix.representations.map((r) => ({ ...r, dataComponents: undefined, dataFreshness: "LIVE" as const })) };
    const calc = calculateTokenValue({ ticker: "NVDA", providerId: "bstocks", tokenAmount: 100 }, legacy);
    expect(calc.freshness).toBe("CACHED");
    expect(calc.totalReferenceValueUSD).not.toBeNull();
  });
});
