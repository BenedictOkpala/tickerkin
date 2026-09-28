import type { ProviderAdapter, RawProviderAssetRecord } from "@/types/provider";
import type { TokenizedRepresentation } from "@/types/token";
import type { OndoAutoDripScaledModel } from "@/types/economic";

export class OndoProviderAdapter implements ProviderAdapter {
  readonly id = "ondo" as const;
  readonly name = "Ondo Finance (Ondo Global Markets)";
  readonly issuer = "Ondo Global Markets / Ondo Finance";
  readonly chain = "BNB Smart Chain" as const;

  normalize(record: RawProviderAssetRecord): TokenizedRepresentation {
    const economicModel: OndoAutoDripScaledModel = {
      mechanism: "auto_drip_scaled",
      description: "Total-return tracker with automated dividend reinvestment (DRIP)",
      scaledUiEnabled: true,
      dividendHandling: "automatic_dividend_reinvestment_drip",
      tokenPriceTracksNav: true,
      provenance: {
        sourceClass: "FIRST_PARTY",
        sourceName: "Ondo Global Markets Documentation",
        sourceRef: "https://docs.ondo.finance",
        confidence: "HIGH",
        notes: "Verified automatic dividend reinvestment with Scaled UI balance on BSC",
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
        secondaryLiquidityStatus: record.liquidityTier ?? "MODERATE",
        primaryDEX: record.secondaryDex ?? "PancakeSwap",
        notes: "Traded 24/7 on BSC DEXes; underlying asset backed 1:1 by qualified custodian",
      },
      provenance: {
        sourceClass: "ON_CHAIN",
        sourceName: "BNB Smart Chain RPC (eth_call) & Ondo Official Portal",
        sourceRef: record.sourceRef ?? "https://docs.ondo.finance",
        confidence: "HIGH",
      },
    };
  }
}

export const ondoAdapter = new OndoProviderAdapter();
