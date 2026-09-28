import { successResponse } from "@/lib/api-response";
import { rwaLens } from "@/lens";

export async function GET() {
  const metadata = {
    service: "RWA Lens",
    version: "0.1.0",
    description:
      "Discovery and normalization infrastructure for tokenized equities on BNB Smart Chain.",
    chain: "BNB Smart Chain",
    chainId: 56,
    supportedProviders: [
      {
        id: "ondo",
        name: "Ondo Finance (Ondo Global Markets)",
        issuer: "Ondo Global Markets / Ondo Finance",
        economicMechanism: "auto_drip_scaled",
      },
      {
        id: "bstocks",
        name: "Binance bStocks",
        issuer: "BTech Holdings Limited (Binance Affiliate)",
        economicMechanism: "multiplier",
      },
      {
        id: "xstocks",
        name: "xStocks (Backed Finance)",
        issuer: "Backed Assets (JE) Limited (acquired by Kraken)",
        economicMechanism: "redemption_rate",
      },
    ],
    supportedTickers: rwaLens.getSupportedTickers(),
    totalVerifiedContracts: rwaLens.getSupportedContracts().length,
    endpoints: {
      discovery: "/api/lens",
      tickerLookup: "/api/lens/ticker/:ticker",
      contractLookup: "/api/lens/contract/:address",
    },
  };

  return successResponse(metadata);
}
