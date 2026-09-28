import type { UnderlyingEquity } from "@/types/equity";
import type { RawProviderAssetRecord } from "@/types/provider";
import type { ProviderId } from "@/types/token";
import { bnbOracleAdapter } from "@/providers/bnb";

export interface RegistryEquityEntry {
  readonly equity: UnderlyingEquity;
  readonly providerRecords: readonly {
    readonly providerId: ProviderId;
    readonly record: RawProviderAssetRecord;
  }[];
}

/**
 * Curated, evidence-verified registry of tokenized equities on BNB Smart Chain.
 *
 * CRITICAL RULE: Only includes contract representations verified via direct
 * on-chain eth_call bytecode execution and first-party issuer documentation.
 * Unverified / candidate contracts downgraded to UNKNOWN in Phase 1.5 are excluded.
 *
 * DATA INTEGRITY RULE: Placeholder / default values (such as fake 'multiplier: 1.0')
 * are excluded. Only verified structural mechanism parameters are stored.
 */
export const VERIFIED_REGISTRY: readonly RegistryEquityEntry[] = [
  {
    equity: {
      ticker: "NVDA",
      name: "NVIDIA Corporation",
      exchange: "NASDAQ",
      quoteCurrency: "USD",
      marketHours: bnbOracleAdapter.formatMarketHours({
        isOpen: false,
        nextOpen: 1790602200,
        nextClose: 1790625600,
        schedule: "America/New_York;0930-1600,0930-1600,0930-1600,0930-1600,0930-1600,C,C",
      }),
      provenance: bnbOracleAdapter.getProvenance(),
    },
    providerRecords: [
      {
        providerId: "ondo",
        record: {
          ticker: "NVDA",
          tokenSymbol: "NVDAon",
          tokenName: "NVIDIA (Ondo Tokenized)",
          contractAddress: "0xa9ee28c80f960b889dfbd1902055218cba016f75",
          decimals: 18,
          status: "ACTIVE",
          secondaryDex: "PancakeSwap",
          liquidityTier: "MODERATE",
          sourceRef: "https://docs.ondo.finance",
        },
      },
      {
        providerId: "bstocks",
        record: {
          ticker: "NVDA",
          tokenSymbol: "NVDAB",
          tokenName: "NVIDIA Corp",
          contractAddress: "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
          decimals: 18,
          status: "ACTIVE",
          secondaryDex: "PancakeSwap",
          liquidityTier: "HIGH",
          sourceRef: "https://www.binance.com",
        },
      },
      {
        providerId: "xstocks",
        record: {
          ticker: "NVDA",
          tokenSymbol: "NVDAx",
          tokenName: "NVIDIA xStock",
          contractAddress: "0xc845b2894dbddd03858fd2d643b4ef725fe0849d",
          decimals: 18,
          status: "ACTIVE",
          economicParams: {
            rateFeedSymbol: "Crypto.NVDAX/NVDA.RR",
          },
          secondaryDex: "Multi-chain (Solana DEXes / CoW Swap / PancakeSwap)",
          liquidityTier: "LOW",
          sourceRef: "https://docs.backed.fi",
        },
      },
    ],
  },
  {
    equity: {
      ticker: "AAPL",
      name: "Apple Inc.",
      exchange: "NASDAQ",
      quoteCurrency: "USD",
      marketHours: bnbOracleAdapter.formatMarketHours({
        isOpen: false,
        schedule: "America/New_York;0930-1600,0930-1600,0930-1600,0930-1600,0930-1600,C,C",
      }),
      provenance: bnbOracleAdapter.getProvenance(),
    },
    providerRecords: [
      {
        providerId: "ondo",
        record: {
          ticker: "AAPL",
          tokenSymbol: "AAPLon",
          tokenName: "Apple (Ondo Tokenized)",
          contractAddress: "0x390a684EF9cADE28A7AD0DFa61AB1Eb3842618c4",
          decimals: 18,
          status: "ACTIVE",
          secondaryDex: "PancakeSwap",
          liquidityTier: "MODERATE",
          sourceRef: "https://docs.ondo.finance",
        },
      },
    ],
  },
  {
    equity: {
      ticker: "TSLA",
      name: "Tesla, Inc.",
      exchange: "NASDAQ",
      quoteCurrency: "USD",
      marketHours: bnbOracleAdapter.formatMarketHours({
        isOpen: false,
        schedule: "America/New_York;0930-1600,0930-1600,0930-1600,0930-1600,0930-1600,C,C",
      }),
      provenance: bnbOracleAdapter.getProvenance(),
    },
    providerRecords: [
      {
        providerId: "ondo",
        record: {
          ticker: "TSLA",
          tokenSymbol: "TSLAon",
          tokenName: "Tesla (Ondo Tokenized)",
          contractAddress: "0x2494b603319d4D9F9715c9f4496d9E0364B59d93",
          decimals: 18,
          status: "ACTIVE",
          secondaryDex: "PancakeSwap",
          liquidityTier: "MODERATE",
          sourceRef: "https://docs.ondo.finance",
        },
      },
    ],
  },
];

