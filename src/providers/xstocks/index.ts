import type { ProviderAdapter, RawProviderAssetRecord } from "@/types/provider";
import type { TokenizedRepresentation } from "@/types/token";
import type { XStocksRedemptionRateModel } from "@/types/economic";

export class XStocksProviderAdapter implements ProviderAdapter {
  readonly id = "xstocks" as const;
  readonly name = "xStocks (Backed Finance)";
  readonly issuer = "Backed Assets (JE) Limited (acquired by Kraken)";
  readonly chain = "BNB Smart Chain" as const;

  normalize(record: RawProviderAssetRecord): TokenizedRepresentation {
    const rawRate = record.economicParams?.redemptionRate;
    const currentRate = typeof rawRate === "number" ? rawRate : undefined;
    const rateFeedSymbol = typeof record.economicParams?.rateFeedSymbol === "string" 
      ? record.economicParams.rateFeedSymbol 
      : undefined;

    const economicModel: XStocksRedemptionRateModel = {
      mechanism: "redemption_rate",
      description: "Continuous Redemption Rate certificate tracker tracking total return",
      currentRate,
      rateFeedSymbol,
      dividendHandling: "redemption_rate_adjustment_or_usdc_airdrop",
      provenance: {
        sourceClass: "FIRST_PARTY",
        sourceName: "Backed Finance / xStocks Documentation",
        sourceRef: "https://docs.backed.fi",
        confidence: "HIGH",
        notes: "Verified tracker certificate with continuous redemption rate / multiplier mechanism",
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
        secondaryLiquidityStatus: record.liquidityTier ?? "LOW",
        primaryDEX: record.secondaryDex ?? "Multi-chain (Solana DEXes / CoW Swap / PancakeSwap)",
        notes: "Multi-chain deployment on BSC; proof of reserves published daily on assets.backed.fi",
      },
      provenance: {
        sourceClass: "ON_CHAIN",
        sourceName: "BNB Smart Chain RPC (eth_call) & Backed Finance Docs",
        sourceRef: record.sourceRef ?? "https://docs.backed.fi",
        confidence: "HIGH",
      },
    };
  }
}

export const xstocksAdapter = new XStocksProviderAdapter();
