"use client";

import { useState, useEffect, useCallback } from "react";
import type { UnderlyingEquity } from "@/types/equity";
import type { TokenizedRepresentation } from "@/types/token";

export interface TickerKinResolvedData {
  readonly query: string;
  readonly lookupType: "ticker" | "contract";
  readonly underlying: UnderlyingEquity;
  readonly representations: readonly TokenizedRepresentation[];
  readonly matchedContractAddress?: string;
  readonly rawJson: Record<string, unknown>;
}

// Backward-compatible alias
export type StockDnaResolvedData = TickerKinResolvedData;

export interface TickerKinError {
  readonly code: string;
  readonly message: string;
}

// Backward-compatible alias
export type StockDnaError = TickerKinError;

export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export function useTickerKin(initialQuery = "NVDA") {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TickerKinResolvedData | null>(null);
  const [error, setError] = useState<TickerKinError | null>(null);

  const executeSearch = useCallback(async (searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);

    const isContract = isValidEvmAddress(clean);

    try {
      if (isContract) {
        // 1. Contract reverse lookup to resolve underlying and matched token
        const contractRes = await fetch(`/api/lens/contract/${encodeURIComponent(clean)}`);
        const contractJson = await contractRes.json();

        if (!contractRes.ok || !contractJson.ok) {
          setData(null);
          setError({
            code: contractJson.error?.code || `HTTP_${contractRes.status}`,
            message: contractJson.error?.message || "Failed to resolve contract on RWA Lens API.",
          });
          return;
        }

        const normalizedContract = contractJson.data.normalizedAddress;
        const resolvedTicker = contractJson.data.underlying?.ticker;

        // 2. Fetch sibling representations for complete Kin lineage display
        let siblingReps: TokenizedRepresentation[] = [contractJson.data.matchedRepresentation];
        let fullPayload: Record<string, unknown> = contractJson;

        if (resolvedTicker) {
          try {
            const tickerRes = await fetch(`/api/lens/ticker/${encodeURIComponent(resolvedTicker)}`);
            const tickerJson = await tickerRes.json();
            if (tickerRes.ok && tickerJson.ok && Array.isArray(tickerJson.data?.representations)) {
              siblingReps = tickerJson.data.representations;
              fullPayload = {
                contractLookup: contractJson,
                tickerLineage: tickerJson,
              };
            }
          } catch {
            // Keep single matched representation if sibling fetch fails
          }
        }

        setData({
          query: clean,
          lookupType: "contract",
          underlying: contractJson.data.underlying,
          representations: siblingReps,
          matchedContractAddress: normalizedContract,
          rawJson: fullPayload,
        });
      } else {
        // Ticker lookup returns underlying + all verified representations
        const tickerRes = await fetch(`/api/lens/ticker/${encodeURIComponent(clean)}`);
        const tickerJson = await tickerRes.json();

        if (!tickerRes.ok || !tickerJson.ok) {
          setData(null);
          setError({
            code: tickerJson.error?.code || `HTTP_${tickerRes.status}`,
            message: tickerJson.error?.message || "Failed to resolve ticker on RWA Lens API.",
          });
          return;
        }

        setData({
          query: clean,
          lookupType: "ticker",
          underlying: tickerJson.data.underlying,
          representations: tickerJson.data.representations,
          rawJson: tickerJson,
        });
      }
    } catch (err) {
      setData(null);
      setError({
        code: "NETWORK_ERROR",
        message: err instanceof Error ? err.message : "Network error connecting to RWA Lens API.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery, executeSearch]);

  return {
    query,
    setQuery,
    loading,
    data,
    error,
    search: executeSearch,
  };
}

// Backward-compatible export
export const useStockDna = useTickerKin;
