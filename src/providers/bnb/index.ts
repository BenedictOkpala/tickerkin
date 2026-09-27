import type { RWAProvider } from "@/types/provider";

/**
 * BNB Chain Native / Ecosystem Tokenized Equities Provider.
 *
 * Unknowns to resolve during discovery:
 * - Direct on-chain registry contracts vs. aggregator protocols
 * - Oracle standards (Chainlink / BNB Oracle feeds)
 * - BEP-20 token standard compliance & compliance extensions
 */
export const bnbProvider: RWAProvider = {
  id: "bnb-rwa",
  name: "BNB RWA",
  chain: "BNB Smart Chain",
};
