import { lookupByTicker } from "@/lens/baseline";
import { attachSearchMetadata } from "@/providers/binance/authenticated-adapter";
import { AuthenticatedBinanceWeb3Client } from "@/providers/binance/authenticated-client";

// TEMPORARY production verification. Remove this route and its diagnostic test after verification.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Failure = "network" | "auth" | "signature" | "permissions" | "region" | "upstream" | "unknown";
const SAFE_MESSAGES = new Set([
  "success", "Success", "OK", "Unauthorized", "Forbidden", "Invalid API key",
  "Invalid signature", "Too many requests", "Access denied",
]);
// Only recognized constants may leave the server; arbitrary upstream strings/numbers cannot.
const SAFE_CODES = new Set<unknown>([0, "0", "000000", 401, 403, 429, 500, 503, "401", "403", "429", "500", "503"]);

export async function GET() {
  const diagnostic = {
    credentialsConfigured: Boolean(process.env.BINANCE_WEB3_API_KEY && process.env.BINANCE_WEB3_SECRET_KEY),
    authenticatedRequestAttempted: false,
    upstreamHttpStatus: null as number | null,
    binanceCode: null as number | string | null,
    binanceMessage: null as string | null,
    recordsReturned: null as number | null,
    strictBscMatches: null as number | null,
    timestamp: new Date().toISOString(),
    success: false,
    failureClassification: null as Failure | null,
  };
  try {
    // Fresh client: a cached observation cannot masquerade as a successful live request.
    const client = new AuthenticatedBinanceWeb3Client({
      fetchFn: async (url, options) => {
        diagnostic.authenticatedRequestAttempted = true;
        let response: Response;
        try {
          // Forward unchanged. Never inspect, serialize, or log the request options.
          response = await globalThis.fetch(url, options);
        } catch {
          diagnostic.failureClassification = "network";
          throw new Error("Diagnostic transport failed");
        }
        diagnostic.upstreamHttpStatus = response.status;
        try {
          const body: unknown = await response.clone().json();
          if (body !== null && typeof body === "object" && !Array.isArray(body)) {
            const envelope = body as Record<string, unknown>;
            if (SAFE_CODES.has(envelope.code)) diagnostic.binanceCode = envelope.code as number | string;
            const message = typeof envelope.message === "string" ? envelope.message
              : typeof envelope.msg === "string" ? envelope.msg : "";
            if (SAFE_MESSAGES.has(message)) diagnostic.binanceMessage = message;
            if (Array.isArray(envelope.data)) diagnostic.recordsReturned = envelope.data.length;
            // Raw messages are used only for coarse classification, never returned or logged.
            if (/signature/i.test(message)) diagnostic.failureClassification = "signature";
            else if (/api.?key|authentication|unauthorized|timestamp/i.test(message)) diagnostic.failureClassification = "auth";
            else if (/region|country|location|jurisdiction/i.test(message)) diagnostic.failureClassification = "region";
            else if (/permission|forbidden|access denied/i.test(message)) diagnostic.failureClassification = "permissions";
          }
        } catch { /* Unreadable bodies remain private; the existing client handles validation. */ }
        return response;
      },
    });
    const result = await client.search("NVDA");
    if (result) {
      const baseline = lookupByTicker("NVDA");
      if (baseline.success) {
        diagnostic.strictBscMatches = baseline.representations.filter(rep =>
          attachSearchMetadata(rep, "NVDA", result).binanceMetadata !== undefined
        ).length;
        diagnostic.success = true;
        diagnostic.failureClassification = null;
      }
    }
    if (!diagnostic.success && !diagnostic.failureClassification) {
      diagnostic.failureClassification = diagnostic.upstreamHttpStatus === 401 ? "auth"
        : diagnostic.upstreamHttpStatus === 403 ? "permissions"
        : diagnostic.upstreamHttpStatus !== null ? "upstream" : "unknown";
    }
  } catch {
    diagnostic.failureClassification ??= "unknown";
  }
  // Explicit scalar allowlist above is the entire response. No upstream object is serialized.
  return Response.json(diagnostic, { headers: { "Cache-Control": "no-store" } });
}
