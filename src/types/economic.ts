import type { EvidenceRecord } from "./provenance";

/**
 * bStocks Multiplier Mechanism:
 * Uses an on-chain Multiplier to account for automatic dividend reinvestment (DRIP)
 * and corporate stock splits:
 * Effective Balance = Raw Balance × Multiplier
 *
 * Note: Dynamic values such as `currentMultiplier` are optional and only populated
 * when verified from live on-chain state or oracle feeds.
 */
export interface BStocksMultiplierModel {
  readonly mechanism: "multiplier";
  readonly description: "Dynamic Multiplier accounting for corporate actions and net dividend reinvestment";
  readonly currentMultiplier?: number;
  readonly formula: "effective_balance = raw_token_balance * multiplier";
  readonly dividendHandling: "automatic_reinvestment_via_multiplier";
  readonly provenance: EvidenceRecord;
}

/**
 * xStocks / Backed Finance Redemption Rate Mechanism:
 * Tracks the total return of the underlying asset through an evolving redemption rate
 * (e.g. Pyth .RR feeds):
 * Effective Exposure = Raw Token Units × Redemption Rate
 *
 * Note: `currentRate` is optional and only populated when verified from live oracle feeds.
 */
export interface XStocksRedemptionRateModel {
  readonly mechanism: "redemption_rate";
  readonly description: "Continuous Redemption Rate certificate tracker tracking total return";
  readonly currentRate?: number;
  readonly rateFeedSymbol?: string;
  readonly dividendHandling: "redemption_rate_adjustment_or_usdc_airdrop";
  readonly provenance: EvidenceRecord;
}

/**
 * Ondo Global Markets Auto-DRIP / Scaled UI Mechanism:
 * Automatically reinvests dividends into the underlying asset, reflected either
 * in the token NAV price or via Scaled UI token balance.
 */
export interface OndoAutoDripScaledModel {
  readonly mechanism: "auto_drip_scaled";
  readonly description: "Total-return tracker with automated dividend reinvestment (DRIP)";
  readonly currentScaleFactor?: number;
  readonly scaledUiEnabled: boolean;
  readonly dividendHandling: "automatic_dividend_reinvestment_drip";
  readonly tokenPriceTracksNav: boolean;
  readonly provenance: EvidenceRecord;
}

/**
 * Generic / Extensible fallback for other/unknown corporate-action mechanisms.
 */
export interface GenericEconomicModel {
  readonly mechanism: "custom" | "unknown";
  readonly description: string;
  readonly details?: Record<string, unknown>;
  readonly provenance: EvidenceRecord;
}

/**
 * Union of all supported provider economic models.
 */
export type EconomicModel =
  | BStocksMultiplierModel
  | XStocksRedemptionRateModel
  | OndoAutoDripScaledModel
  | GenericEconomicModel;
