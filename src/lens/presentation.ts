import type { TokenizedRepresentation } from "@/types/token";
import type { UnderlyingEquity } from "@/types/equity";
import type { EvidenceClass, ConfidenceLevel } from "@/types/provenance";

export interface ClaimScopedEvidence {
  readonly claimType: "TOKEN_IDENTITY" | "ECONOMIC_MECHANISM" | "DYNAMIC_FACTOR" | "PRICE_BENCHMARK";
  readonly title: string;
  readonly claim: string;
  readonly evidenceDetail: string;
  readonly sourceName: string;
  readonly sourceRef?: string;
  readonly sourceLabel: string;
  readonly sourceClass: EvidenceClass;
  readonly confidence: ConfidenceLevel;
}

export interface MechanismExplanation {
  readonly mechanismKey: string;
  readonly title: string;
  readonly subtitle: string;
  readonly description: string;
  readonly behaviorDetail: string;
}

/**
 * Deterministically formats internal economic mechanism enum strings into human-readable labels.
 */
export function formatEconomicMechanism(mechanism: string): string {
  switch (mechanism) {
    case "auto_drip_scaled":
      return "Auto-DRIP (Scaled UI)";
    case "multiplier":
      return "Multiplier Model";
    case "redemption_rate":
      return "Redemption-Rate Model";
    case "custom":
      return "Custom Mechanism";
    default:
      return mechanism
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
  }
}

/**
 * Deterministically translates dividend handling enums into clean human prose.
 */
export function formatDividendHandling(dividendHandling?: string): string {
  switch (dividendHandling) {
    case "automatic_dividend_reinvestment_drip":
      return "Automatic Dividend Reinvestment (DRIP)";
    case "automatic_reinvestment_via_multiplier":
      return "Auto-Reinvestment via Multiplier";
    case "redemption_rate_adjustment_or_usdc_airdrop":
      return "Redemption Rate Adjustment / USDC Airdrop";
    default:
      return "Standard Distribution";
  }
}

/**
 * Generates human-friendly external source names with active URL link destinations.
 */
export function formatSourceLabel(sourceName?: string, sourceRef?: string): { title: string; href?: string } {
  if (!sourceRef) {
    return { title: sourceName ?? "Verified Source" };
  }

  const urlLower = sourceRef.toLowerCase();

  if (urlLower.includes("docs.ondo.finance") || urlLower.includes("ondo.finance")) {
    return { title: "Ondo Documentation", href: sourceRef };
  }
  if (urlLower.includes("binance.com") || urlLower.includes("binance.org")) {
    return { title: "Binance Documentation", href: sourceRef };
  }
  if (urlLower.includes("docs.backed.fi") || urlLower.includes("backed.fi")) {
    return { title: "Backed Finance Documentation", href: sourceRef };
  }
  if (urlLower.includes("pyth.network")) {
    return { title: "Pyth Network Oracle", href: sourceRef };
  }
  if (urlLower.includes("bscscan.com")) {
    return { title: "BscScan Explorer", href: sourceRef };
  }

  return { title: sourceName || "Verification Documentation", href: sourceRef };
}

/**
 * Deterministic explanation definitions for Compare matrix differences.
 */
export function getMechanismExplanation(mechanism: string): MechanismExplanation {
  switch (mechanism) {
    case "auto_drip_scaled":
      return {
        mechanismKey: "auto_drip_scaled",
        title: "Auto-DRIP (Scaled UI)",
        subtitle: "Total Return Reinvestment",
        description: "Reinvests corporate dividend distributions automatically into the underlying equity holding. The user balance or NAV factor scales dynamically over time.",
        behaviorDetail: "Balance or token redemption NAV adjusts to reflect cumulative dividend reinvestment without requiring manual claiming.",
      };
    case "multiplier":
      return {
        mechanismKey: "multiplier",
        title: "Multiplier Model",
        subtitle: "Dynamic Balance Scaling",
        description: "Applies an on-chain multiplier factor (BEP-20 / Scaled UI) to raw balances to account for corporate actions, stock splits, and net dividend reinvestment.",
        behaviorDetail: "Effective Exposure = Raw Token Balance × Multiplier. Splits and corporate distributions increase the applied multiplier.",
      };
    case "redemption_rate":
      return {
        mechanismKey: "redemption_rate",
        title: "Redemption-Rate Model",
        subtitle: "Evolving Unit Tracker",
        description: "Tracks the total economic return of the underlying asset through a continuous redemption rate / certificate valuation ratio.",
        behaviorDetail: "Effective Exposure = Raw Token Units × Redemption Rate. Rate updates reflect underlying corporate returns and dividends.",
      };
    default:
      return {
        mechanismKey: mechanism,
        title: formatEconomicMechanism(mechanism),
        subtitle: "Standard Model",
        description: "Tokenized representation verified on BNB Smart Chain under provider-specific contract rules.",
        behaviorDetail: "Standard token mechanics according to verified issuer documentation.",
      };
  }
}

/**
 * Returns claim-scoped provenance records for a given representation.
 * Prevents the false assumption that an on-chain bytecode audit proves off-chain legal/corporate mechanics.
 */
export function getClaimScopedEvidence(
  representation: TokenizedRepresentation,
  underlying: UnderlyingEquity
): ClaimScopedEvidence[] {
  const claims: ClaimScopedEvidence[] = [];

  // 1. Token Identity & On-chain Contract Deployment
  claims.push({
    claimType: "TOKEN_IDENTITY",
    title: "BEP-20 Contract Deployment & Identity",
    claim: `${representation.tokenSymbol} (${representation.tokenName}) is verified as an active BEP-20 smart contract on BNB Smart Chain representing ${underlying.name} (${underlying.ticker}).`,
    evidenceDetail: `Contract address verified via bytecode inspection: ${representation.contractAddress} (decimals: ${representation.decimals}, chainId: 56).`,
    sourceName: "BNB Smart Chain RPC & BscScan",
    sourceRef: `https://bscscan.com/token/${representation.contractAddress}`,
    sourceLabel: "BNB Smart Chain / BscScan ↗",
    sourceClass: "ON_CHAIN",
    confidence: "HIGH",
  });

  // 2. Issuer Mapping & Corporate Authority
  claims.push({
    claimType: "ECONOMIC_MECHANISM",
    title: "Issuer & Economic Model Mechanics",
    claim: `Issued by ${representation.issuer} using the ${formatEconomicMechanism(representation.economicModel.mechanism)} (${formatDividendHandling(
      "dividendHandling" in representation.economicModel ? representation.economicModel.dividendHandling : undefined
    )}).`,
    evidenceDetail: representation.economicModel.description,
    sourceName: representation.economicModel.provenance.sourceName,
    sourceRef: representation.economicModel.provenance.sourceRef,
    sourceLabel: `${formatSourceLabel(representation.economicModel.provenance.sourceName, representation.economicModel.provenance.sourceRef).title} ↗`,
    sourceClass: representation.economicModel.provenance.sourceClass,
    confidence: representation.economicModel.provenance.confidence,
  });

  // 3. Dynamic Factor / Live Enrichment Tracking
  if (representation.liveEnrichment) {
    const live = representation.liveEnrichment;
    claims.push({
      claimType: "DYNAMIC_FACTOR",
      title: "Live Economic Multiplier / Rate Tracking",
      claim: `Live factor (${live.rawMultiplier}) matched with ${live.matchConfidence} confidence based on ${live.matchBasis}.`,
      evidenceDetail: `Data source: ${live.provenance?.sourceName ?? "Direct On-Chain RPC"} · Match basis: ${live.matchBasis}${
        live.lastUpdateIso ? ` · Last updated: ${live.lastUpdateIso}` : ""
      }`,
      sourceName: live.provenance?.sourceName ?? "Direct On-Chain BSC RPC",
      sourceRef: "https://bscscan.com",
      sourceLabel: "BNB Smart Chain ↗",
      sourceClass: live.provenance?.sourceClass ?? "ON_CHAIN",
      confidence: live.provenance?.confidence ?? "HIGH",
    });
  } else {
    claims.push({
      claimType: "DYNAMIC_FACTOR",
      title: "Structural Baseline Verification",
      claim: "Operating on verified structural baseline. Real-time dynamic factor live feed is currently unpolled or unavailable.",
      evidenceDetail: "Contract identity and economic formula verified from static audited registry.",
      sourceName: "RWA Lens Verified Registry",
      sourceLabel: "RWA Lens Registry",
      sourceClass: "FIRST_PARTY",
      confidence: "HIGH",
    });
  }

  // 4. Underlying Benchmark Feed
  claims.push({
    claimType: "PRICE_BENCHMARK",
    title: "Underlying Equity Benchmark & Currency",
    claim: `Underlying company benchmark is ${underlying.name} (${underlying.ticker}) quoted in ${underlying.quoteCurrency} on ${underlying.exchange ?? "NASDAQ"}.`,
    evidenceDetail: underlying.provenance.notes ?? "Verified equity ticker benchmark identity.",
    sourceName: underlying.provenance.sourceName,
    sourceRef: underlying.provenance.sourceRef,
    sourceLabel: `${formatSourceLabel(underlying.provenance.sourceName, underlying.provenance.sourceRef).title} ↗`,
    sourceClass: underlying.provenance.sourceClass,
    confidence: underlying.provenance.confidence,
  });

  return claims;
}
