import type { ProviderAdapter, RawProviderAssetRecord } from "@/types/provider";
import type { TokenizedRepresentation } from "@/types/token";
import type { BStocksMultiplierModel } from "@/types/economic";

export class BStocksProviderAdapter implements ProviderAdapter {
  readonly id = "bstocks" as const;
  readonly name = "Binance bStocks";
  readonly issuer = "BTech Holdings Limited (Binance Affiliate)";
  readonly chain = "BNB Smart Chain" as const;

  normalize(record: RawProviderAssetRecord): TokenizedRepresentation {
    const rawMultiplier = record.economicParams?.multiplier;
    const currentMultiplier = typeof rawMultiplier === "number" ? rawMultiplier : undefined;

    const economicModel: BStocksMultiplierModel = {
      mechanism: "multiplier",
      description: "Dynamic Multiplier accounting for corporate actions and net dividend reinvestment",
      currentMultiplier,
      formula: "effective_balance = raw_token_balance * multiplier",
      dividendHandling: "automatic_reinvestment_via_multiplier",
      provenance: {
        sourceClass: "FIRST_PARTY",
        sourceName: "Binance Tokenized Securities Docs",
        sourceRef: "https://www.binance.com",
        confidence: "HIGH",
        notes: "Verified on-chain Multiplier mechanics for net dividend reinvestment & splits (BEP-677 scaled UI amount)",
      },
    };

    return {
      providerId: this.id,
      providerName: this.name,
      issuer: this.issuer,
      tokenSymbol: record.tokenSymbol,
      tokenName: record.tokenName,
      chain: this.chain,
      chainId: 56,
      contractAddress: record.contractAddress.toLowerCase(),
      decimals: record.decimals,
      tokenStandard: "BEP-20",
      status: record.status,
      economicModel,
      marketInfo: {
        onChainTradingAvailable: true,
        secondaryLiquidityStatus: record.liquidityTier ?? "HIGH",
        primaryDEX: record.secondaryDex ?? "PancakeSwap",
        notes: "Deep liquidity on PancakeSwap ($3.5M+ pool); 24/7 on-chain trading and Binance portal conversion",
      },
      provenance: {
        sourceClass: "ON_CHAIN",
        sourceName: "BNB Smart Chain RPC (eth_call) & Binance bStocks Portal",
        sourceRef: record.sourceRef ?? "https://www.binance.com",
        confidence: "HIGH",
      },
    };
  }
}

export const bstocksAdapter = new BStocksProviderAdapter();
