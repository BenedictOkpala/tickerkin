// TEMPORARY: remove with src/app/api/diagnostics/binance-rwa/route.ts after verification.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { randomBytes } from "node:crypto";
import { GET, dynamic, runtime } from "@/app/api/diagnostics/binance-rwa/route";
import { lookupByTicker } from "@/lens/baseline";

const baseline = lookupByTicker("NVDA");
if (!baseline.success) throw new Error("Baseline missing");
const bstock = baseline.representations.find(rep => rep.providerId === "bstocks")!;
const asset = { platformId: "bstock", binanceChainId: "56", tokenContractAddress: bstock.contractAddress, tokenSymbol: "NVDAB" };
const envelope = (assets = [asset]) => ({ code: 0, success: true, message: "Success", data: [{ ticker: "NVDA", companyName: "NVIDIA", assets }] });
let key: string, secret: string;
beforeEach(() => {
  key = randomBytes(16).toString("hex");
  secret = randomBytes(32).toString("hex");
  vi.stubEnv("BINANCE_WEB3_API_KEY", key);
  vi.stubEnv("BINANCE_WEB3_SECRET_KEY", secret);
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("temporary authenticated RWA diagnostic", () => {
  it("uses a fresh signed NVDA request and returns only diagnostic scalars", async () => {
    let signature = "";
    const fetchFn = vi.fn(async (url: string | URL | Request, options?: RequestInit) => {
      expect(url).toBe("https://web3.binance.com/build/api/v1/dex/market/rwa/search?keyword=NVDA");
      signature = (options!.headers as Record<string, string>)["X-OC-SIGN"];
      expect(signature.length > 0).toBe(true);
      return Response.json(envelope());
    });
    vi.stubGlobal("fetch", fetchFn);
    for (let i = 0; i < 2; i++) {
      const response = await GET();
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      const text = await response.text();
      for (const sensitive of [key, secret, signature, "X-OC-", "NVIDIA", bstock.contractAddress]) expect(text.includes(sensitive)).toBe(false);
      const body = JSON.parse(text);
      expect(Object.keys(body).sort()).toEqual(["credentialsConfigured", "authenticatedRequestAttempted", "upstreamHttpStatus", "binanceCode", "binanceMessage", "recordsReturned", "strictBscMatches", "timestamp", "success", "failureClassification"].sort());
      expect(body).toMatchObject({ credentialsConfigured: true, authenticatedRequestAttempted: true, upstreamHttpStatus: 200, binanceCode: 0, binanceMessage: "Success", recordsReturned: 1, strictBscMatches: 1, success: true, failureClassification: null });
      expect(Number.isFinite(Date.parse(body.timestamp))).toBe(true);
    }
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(runtime).toBe("nodejs"); expect(dynamic).toBe("force-dynamic");
  });
  it.each(["BINANCE_WEB3_API_KEY", "BINANCE_WEB3_SECRET_KEY"])("skips transport without %s", async name => {
    vi.stubEnv(name, ""); const fetchFn = vi.fn(); vi.stubGlobal("fetch", fetchFn);
    expect(await (await GET()).json()).toMatchObject({ credentialsConfigured: false, authenticatedRequestAttempted: false, upstreamHttpStatus: null, recordsReturned: null, strictBscMatches: null, success: false, failureClassification: "unknown" });
    expect(fetchFn).not.toHaveBeenCalled();
  });
  it.each([[401, "auth"], [403, "permissions"], [429, "upstream"], [503, "upstream"]])("classifies HTTP %i without exposing its body", async (status, classification) => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ code: secret, message: key, raw: secret }, { status: status as number })));
    const text = await (await GET()).text();
    expect(text.includes(key)).toBe(false); expect(text.includes(secret)).toBe(false);
    expect(JSON.parse(text)).toMatchObject({ upstreamHttpStatus: status, binanceCode: null, binanceMessage: null, success: false, failureClassification: classification });
  });
  it.each([["Invalid signature", "signature"], ["Restricted country", "region"]])("classifies %s safely", async (message, classification) => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ message }, { status: 403 })));
    expect(await (await GET()).json()).toMatchObject({ success: false, failureClassification: classification, binanceMessage: message === "Invalid signature" ? message : null });
  });
  it("suppresses reflected signing material, upstream bodies, and exception details without logging", async () => {
    const logs = [vi.spyOn(console, "log"), vi.spyOn(console, "warn"), vi.spyOn(console, "error")];
    vi.stubGlobal("fetch", vi.fn(async (_url, options?: RequestInit) => {
      const headers = options!.headers as Record<string, string>;
      return Response.json({ code: headers["X-OC-SIGN"], message: headers["X-OC-SIGN"], headers, raw: secret });
    }));
    expect(await (await GET()).json()).toMatchObject({ binanceCode: null, binanceMessage: null, success: false, failureClassification: "upstream" });
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error(key + secret); }));
    expect(await (await GET()).json()).toMatchObject({ upstreamHttpStatus: null, success: false, failureClassification: "network" });
    for (const log of logs) expect(log).not.toHaveBeenCalled();
  });
  it("reports incompatible schemas as upstream failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ code: 0, success: true, data: [{}] })));
    expect(await (await GET()).json()).toMatchObject({ upstreamHttpStatus: 200, recordsReturned: 1, strictBscMatches: null, success: false, failureClassification: "upstream" });
  });
  it.each([[{ ...asset, binanceChainId: "1" }], [{ ...asset, platformId: "unknown" }], [{ ...asset, tokenContractAddress: "0x" + "0".repeat(40) }], [asset, asset]])("preserves strict matching and duplicate rejection", async (...assets) => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(envelope(assets))));
    expect(await (await GET()).json()).toMatchObject({ success: true, strictBscMatches: 0, failureClassification: null });
  });
});
