import type { BinanceLiveEnrichment } from "@/types/binance";

/**
 * Verified BSC RPC endpoints prioritized by benchmarked low-latency and reliability.
 */
export const DEFAULT_BSC_RPC_ENDPOINTS: readonly string[] = [
  "https://bsc.publicnode.com",
  "https://bsc-rpc.publicnode.com",
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.binance.org",
  "https://bsc-dataseed1.ninicoin.io",
  "https://bsc-dataseed1.defibit.io",
];

/**
 * Standard function selector for bStocks multiplier:
 * function multiplier() external view returns (uint256) -> 0xdc767007
 */
export const BSTOCKS_MULTIPLIER_SELECTOR = "0xdc767007";

export interface BscMultiplierResult {
  readonly rawMultiplier: string;
  readonly multiplierValue: number;
  readonly rawHex: string;
  readonly rpcEndpoint: string;
  readonly fetchedAt: string;
}

/**
 * Safely decodes a 32-byte EVM hex return value representing an 18-decimal fixed-point number.
 */
export function decodeMultiplier18Decimals(hex: string): {
  rawMultiplier: string;
  multiplierValue: number;
} | null {
  if (!hex || typeof hex !== "string" || !hex.startsWith("0x") || hex.length !== 66) {
    return null;
  }

  try {
    const rawBigInt = BigInt(hex);
    if (rawBigInt <= 0n) {
      return null;
    }

    const str = rawBigInt.toString().padStart(19, "0");
    const whole = str.slice(0, str.length - 18);
    const frac = str.slice(str.length - 18);
    const formatted = `${whole}.${frac}`;
    const multiplierValue = Number.parseFloat(formatted);

    if (!Number.isFinite(multiplierValue) || Number.isNaN(multiplierValue) || multiplierValue <= 0) {
      return null;
    }

    return {
      rawMultiplier: formatted,
      multiplierValue,
    };
  } catch {
    return null;
  }
}

/**
 * Calls a BSC contract via JSON-RPC `eth_call` to retrieve the current multiplier factor.
 * Automatically tries fallback RPC endpoints if the primary endpoint times out or fails.
 */
export async function fetchBStocksMultiplierFromRpc(
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
              data: BSTOCKS_MULTIPLIER_SELECTOR,
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
 * Converts a BSC on-chain multiplier result into the standard LiveEnrichment model.
 */
export function bscMultiplierToEnrichment(
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
