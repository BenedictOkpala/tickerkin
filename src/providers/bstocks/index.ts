import type { RWAProvider } from "@/types/provider";

/**
 * bStocks Tokenized Equities Provider.
 *
 * Unknowns to resolve during discovery:
 * - Smart contract addresses and deployment status on BNB Smart Chain
 * - Secondary market liquidity, DEX trading pairs, and oracle sources
 * - Verification standards for underlying stock collateral
 */
export const bstocksProvider: RWAProvider = {
  id: "bstocks",
  name: "bStocks",
  chain: "BNB Smart Chain",
};
