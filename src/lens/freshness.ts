import type { BinanceLiveEnrichment } from "@/types/binance";
import type { DataComponentFreshness } from "@/types/comparison";

/** Only direct, uncached RPC reads establish live factor freshness here.
 * Binance's client may return cached records after a failed refresh without
 * marking that fact, so its enrichment is conservatively described as cached.
 */
export function getFactorFreshness(enrichment?: BinanceLiveEnrichment): DataComponentFreshness["status"] {
  if (!enrichment) return "UNAVAILABLE";
  return enrichment.matchBasis === "DIRECT_ON_CHAIN_BSC_ETH_CALL" &&
    enrichment.provenance.sourceClass === "ON_CHAIN"
    ? "LIVE"
    : "CACHED";
}

export function formatFactorFreshness(component?: DataComponentFreshness): string {
  if (!component) return "Verified factor"; // Legacy payload: do not assume live.
  switch (component.status) {
    case "LIVE": return "Live factor";
    case "CACHED": return "Cached factor";
    case "SNAPSHOT": return "Snapshot factor";
    case "UNAVAILABLE": return "Factor unavailable";
  }
}

export function formatFreshnessDetail(component?: DataComponentFreshness): string {
  if (!component) return "Freshness metadata unavailable";
  return [component.status, component.source,
    component.timestamp ? "As of " + component.timestamp : "Capture timestamp not recorded",
  ].filter(Boolean).join(" · ");
}
