import { describe, it, expect } from "vitest";
import {
  formatEconomicMechanism,
  formatDividendHandling,
  formatSourceLabel,
  getMechanismExplanation,
  getClaimScopedEvidence,
} from "../src/lens/presentation";
import { lookupByTicker, lookupByContract, getProvidersCatalog } from "../src/lens/engine";

describe("Phase 6B Representation Intelligence & Compare/Evidence Integrity", () => {
  describe("1. Human-Readable Economic Mechanism Translations", () => {
    it("should translate raw auto_drip_scaled to 'Auto-DRIP (Scaled UI)'", () => {
      expect(formatEconomicMechanism("auto_drip_scaled")).toBe("Auto-DRIP (Scaled UI)");
    });

    it("should translate raw multiplier to 'Multiplier Model'", () => {
      expect(formatEconomicMechanism("multiplier")).toBe("Multiplier Model");
    });

    it("should translate raw redemption_rate to 'Redemption-Rate Model'", () => {
      expect(formatEconomicMechanism("redemption_rate")).toBe("Redemption-Rate Model");
    });

    it("should gracefully handle custom or unknown mechanisms", () => {
      expect(formatEconomicMechanism("custom")).toBe("Custom Mechanism");
      expect(formatEconomicMechanism("oracle_nav_scaled")).toBe("Oracle Nav Scaled");
    });
  });

  describe("2. Human-Readable Dividend & Corporate Actions Translations", () => {
    it("should translate automatic_dividend_reinvestment_drip", () => {
      expect(formatDividendHandling("automatic_dividend_reinvestment_drip")).toBe(
        "Automatic Dividend Reinvestment (DRIP)"
      );
    });

    it("should translate automatic_reinvestment_via_multiplier", () => {
      expect(formatDividendHandling("automatic_reinvestment_via_multiplier")).toBe(
        "Auto-Reinvestment via Multiplier"
      );
    });

    it("should translate redemption_rate_adjustment_or_usdc_airdrop", () => {
      expect(formatDividendHandling("redemption_rate_adjustment_or_usdc_airdrop")).toBe(
        "Redemption Rate Adjustment / USDC Airdrop"
      );
    });

    it("should fallback cleanly for undefined dividend policies", () => {
      expect(formatDividendHandling(undefined)).toBe("Standard Distribution");
    });
  });

  describe("3. Deterministic Mechanism Differences Explanations", () => {
    it("should return detailed structured explanation for auto_drip_scaled", () => {
      const exp = getMechanismExplanation("auto_drip_scaled");
      expect(exp.title).toBe("Auto-DRIP (Scaled UI)");
      expect(exp.description).toContain("dividend distributions");
      expect(exp.behaviorDetail.length).toBeGreaterThan(15);
    });

    it("should return detailed structured explanation for multiplier", () => {
      const exp = getMechanismExplanation("multiplier");
      expect(exp.title).toBe("Multiplier Model");
      expect(exp.description).toContain("multiplier factor");
      expect(exp.behaviorDetail).toContain("Raw Token Balance");
    });

    it("should return detailed structured explanation for redemption_rate", () => {
      const exp = getMechanismExplanation("redemption_rate");
      expect(exp.title).toBe("Redemption-Rate Model");
      expect(exp.description).toContain("redemption rate");
      expect(exp.behaviorDetail).toContain("Redemption Rate");
    });
  });

  describe("4. Claim-Scoped Provenance Model", () => {
    it("should generate segregated claims for NVDA Ondo representation", () => {
      const lookup = lookupByTicker("NVDA");
      expect(lookup.success).toBe(true);

      if (lookup.success) {
        const ondo = lookup.representations.find((r) => r.providerId === "ondo");
        expect(ondo).toBeDefined();

        const claims = getClaimScopedEvidence(ondo!, lookup.underlying);
        expect(claims.length).toBeGreaterThanOrEqual(4);

        // 1. Token Identity Claim (ON_CHAIN)
        const identityClaim = claims.find((c) => c.claimType === "TOKEN_IDENTITY");
        expect(identityClaim).toBeDefined();
        expect(identityClaim?.sourceClass).toBe("ON_CHAIN");
        expect(identityClaim?.confidence).toBe("HIGH");
        expect(identityClaim?.sourceRef).toContain("bscscan.com");

        // 2. Economic Mechanism Claim (FIRST_PARTY)
        const mechClaim = claims.find((c) => c.claimType === "ECONOMIC_MECHANISM");
        expect(mechClaim).toBeDefined();
        expect(mechClaim?.sourceClass).toBe("FIRST_PARTY");
        expect(mechClaim?.confidence).toBe("HIGH");
        expect(mechClaim?.claim).toContain("Auto-DRIP (Scaled UI)");

        // 3. Price Benchmark Claim (ORACLE)
        const benchmarkClaim = claims.find((c) => c.claimType === "PRICE_BENCHMARK");
        expect(benchmarkClaim).toBeDefined();
        expect(benchmarkClaim?.sourceClass).toBe("ORACLE");
      }
    });

    it("should distinguish static baseline from live enrichment in claims", () => {
      const lookup = lookupByTicker("NVDA");
      expect(lookup.success).toBe(true);

      if (lookup.success) {
        const xstocks = lookup.representations.find((r) => r.providerId === "xstocks");
        expect(xstocks).toBeDefined();

        const claims = getClaimScopedEvidence(xstocks!, lookup.underlying);
        const dynamicFactorClaim = claims.find((c) => c.claimType === "DYNAMIC_FACTOR");
        expect(dynamicFactorClaim).toBeDefined();
        // Since xstocks on BSC is not matched to Solana live feed, it uses static verified baseline
        expect(dynamicFactorClaim?.title).toBe("Structural Baseline Verification");
        expect(dynamicFactorClaim?.claim).toContain("structural baseline");
      }
    });
  });

  describe("5. Clean Friendly Source URL Formatter", () => {
    it("should generate friendly titles for official documentation domains", () => {
      expect(formatSourceLabel("Ondo", "https://docs.ondo.finance/token").title).toBe("Ondo Documentation");
      expect(formatSourceLabel("Binance", "https://www.binance.com/bapi").title).toBe("Binance Documentation");
      expect(formatSourceLabel("Backed", "https://docs.backed.fi/nvda").title).toBe("Backed Finance Documentation");
      expect(formatSourceLabel("Pyth", "https://pyth.network/price-feeds").title).toBe("Pyth Network Oracle");
      expect(formatSourceLabel("BscScan", "https://bscscan.com/token/0x123").title).toBe("BscScan Explorer");
    });
  });

  describe("6. Provider Issuer Entity & Catalog Integrity", () => {
    it("should provide clean corporate entity names without unverified acquisition or affiliate rumors", () => {
      const providers = getProvidersCatalog();

      const ondo = providers.find((p) => p.id === "ondo");
      expect(ondo?.issuer).toBe("Ondo Global Markets");

      const bstocks = providers.find((p) => p.id === "bstocks");
      expect(bstocks?.issuer).toBe("BTech Holdings Limited");

      const xstocks = providers.find((p) => p.id === "xstocks");
      expect(xstocks?.issuer).toBe("Backed Assets (JE) Limited");
    });
  });

  describe("7. Ticker & Contract Lookups Parity", () => {
    it("should maintain 100% lookup consistency for NVDA, AAPL, TSLA", () => {
      const tickers = ["NVDA", "AAPL", "TSLA"];
      for (const ticker of tickers) {
        const res = lookupByTicker(ticker);
        expect(res.success).toBe(true);
        if (res.success) {
          expect(res.underlying.ticker).toBe(ticker);
          expect(res.representations.length).toBeGreaterThanOrEqual(1);
        }
      }
    });

    it("should accurately resolve contract lookup for Ondo NVDA", () => {
      const res = lookupByContract("0xa9ee28c80f960b889dfbd1902055218cba016f75");
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.underlying.ticker).toBe("NVDA");
        expect(res.matchedRepresentation.tokenSymbol).toBe("NVDAon");
      }
    });
  });
});
