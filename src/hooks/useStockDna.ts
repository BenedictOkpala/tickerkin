"use client";

import { useState, useEffect, useCallback } from "react";
import type { UnderlyingEquity } from "@/types/equity";
import type { TokenizedRepresentation } from "@/types/token";

export interface StockDnaResolvedData {
  readonly query: string;
  readonly lookupType: "ticker" | "contract";
  readonly underlying: UnderlyingEquity;
  readonly representations: readonly TokenizedRepresentation[];
  readonly matchedContractAddress?: string;
  readonly rawJson: Record<string, unknown>;
}

export interface StockDnaError {
  readonly code: string;
  readonly message: string;
}

export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export function useStockDna(initialQuery = "NVDA") {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StockDnaResolvedData | null>(null);
  const [error, setError] = useState<StockDnaError | null>(null);

  const executeSearch = useCallback(async (searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);

    const isContract = isValidEvmAddress(clean);
    const endpoint = isContract
      ? `/api/lens/contract/${encodeURIComponent(clean)}`
      : `/api/lens/ticker/${encodeURIComponent(clean)}`;

    try {
      const res = await fetch(endpoint);
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setData(null);
        setError({
          code: json.error?.code || `HTTP_${res.status}`,
          message: json.error?.message || "Failed to resolve query on RWA Lens API.",
        });
        return;
      }

      if (isContract) {
        // Contract lookup returns { underlying, matchedRepresentation, normalizedAddress }
        setData({
          query: clean,
          lookupType: "contract",
          underlying: json.data.underlying,
          representations: [json.data.matchedRepresentation],
          matchedContractAddress: json.data.normalizedAddress,
          rawJson: json,
        });
      } else {
        // Ticker lookup returns { underlying, representations }
        setData({
          query: clean,
          lookupType: "ticker",
          underlying: json.data.underlying,
          representations: json.data.representations,
          rawJson: json,
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
