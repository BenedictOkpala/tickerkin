import type { RWAProvider } from "@/types/provider";

/**
 * Ondo Finance Tokenized Assets Provider.
 *
 * Unknowns to resolve during discovery:
 * - Specific BNB Smart Chain bridge/native token addresses
 * - KYC/permissioned token restrictions vs. permissionless data availability
 * - Price feed oracle sources and historical dividend distributions
 */
export const ondoProvider: RWAProvider = {
  id: "ondo",
  name: "Ondo",
  chain: "BNB Smart Chain",
};
