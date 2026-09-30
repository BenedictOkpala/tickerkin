import type { BinanceLiveEnrichment } from "@/types/binance";
import {
  DEFAULT_BSC_RPC_ENDPOINTS,
  decodeMultiplier18Decimals,
  type BscMultiplierResult,
} from "@/providers/bstocks/bsc-rpc";

/**
 * Standard function selector for xStocks / Backed multiplier on BNB Smart Chain:
 * function multiplier() external view returns (uint256) -> 0x1b3ed722
 */
export const XSTOCKS_MULTIPLIER_SELECTOR = "0x1b3ed722";

/**
 * Diagnostic alternative selector on BackedAutoFeeTokenImplementation:
 * function lastMultiplier() external view returns (uint256) -> 0xd1786aab
 */
export const XSTOCKS_LAST_MULTIPLIER_SELECTOR = "0xd1786aab";

export type { BscMultiplierResult };

/**
 * Calls an xStocks / Backed BSC contract via JSON-RPC `eth_call` to retrieve the current multiplier factor.
 * Automatically tries fallback RPC endpoints if the primary endpoint times out or fails.
 */
export async function fetchXStocksMultiplierFromRpc(
  contractAddress: string,
  rpcEndpoints: readonly string[] = DEFAULT_BSC_RPC_ENDPOINTS,
  timeoutMs: number = 3500
): Promise<BscMultiplierResult | null> {
  const cleanAddress = contractAddress.trim().toLowerCase();

  for (const rpcUrl of rpcEndpoints) {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [
            {
              to: cleanAddress,
              data: XSTOCKS_MULTIPLIER_SELECTOR,
            },
            "latest",
          ],
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (!response.ok) {
        continue;
      }

      const json = await response.json();
      const resultHex = json?.result;

      if (typeof resultHex === "string" && resultHex.startsWith("0x")) {
        const decoded = decodeMultiplier18Decimals(resultHex);
        if (decoded) {
          return {
            rawMultiplier: decoded.rawMultiplier,
            multiplierValue: decoded.multiplierValue,
            rawHex: resultHex,
            rpcEndpoint: rpcUrl,
            fetchedAt: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Gracefully advance to next RPC fallback on network timeout or RPC error
      continue;
    }
  }

  // All RPC attempts failed or returned invalid data
  return null;
}

/**
 * Converts an xStocks BSC on-chain multiplier result into the standard LiveEnrichment model.
 */
export function xstocksMultiplierToEnrichment(
  result: BscMultiplierResult,
  contractAddress: string
): BinanceLiveEnrichment {
  return {
    rawMultiplier: result.rawMultiplier,
    multiplierValue: result.multiplierValue,
    lastUpdateIso: result.fetchedAt,
    decimals: 18,
    matchConfidence: "HIGH",
    matchBasis: "DIRECT_ON_CHAIN_BSC_ETH_CALL",
    provenance: {
      sourceClass: "ON_CHAIN",
      sourceName: "BNB Smart Chain (eth_call multiplier())",
      sourceRef: `https://bscscan.com/token/${contractAddress}`,
      confidence: "HIGH",
      notes: `Verified on-chain via BSC RPC ${result.rpcEndpoint}`,
    },
  };
}
