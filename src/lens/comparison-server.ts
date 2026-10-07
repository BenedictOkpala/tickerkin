import type { EquityComparisonMatrix } from "@/types/comparison";
import { lookupByTickerAsync } from "./engine";
import { getUnderlyingEquityReference, buildEquityComparison } from "./comparison";
/**
 * Builds the complete Equity Comparison Matrix asynchronously with dynamic enrichment.
 */
export async function buildEquityComparisonAsync(
  ticker: string
): Promise<EquityComparisonMatrix | null> {
  const cleanTicker = ticker.trim().toUpperCase();
  const underlying = getUnderlyingEquityReference(cleanTicker);

  if (!underlying) {
    return null;
  }

  const lookup = await lookupByTickerAsync(cleanTicker);
  if (!lookup.success) {
    return null;
  }

  return buildEquityComparison(cleanTicker, lookup.representations);
}

