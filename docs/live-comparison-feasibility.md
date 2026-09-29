# TickerKin / RWA Lens: Interactive Comparison Data Feasibility Study

**Project**: `rwa-lens` (TickerKin)  
**Phase**: 7B — Interactive Comparison Data Feasibility  
**Date**: September 29, 2026  
**Status**: Completed Investigation  
**Author**: RWA Lens Core Architecture & Data Integrity Team  

---

## Executive Summary

TickerKin is a tokenized equity intelligence product built on top of the RWA Lens normalization engine. While TickerKin currently delivers deep structural transparency across token mechanisms, legal frameworks, and custody structures, its interaction model remains primarily read-only.

For the hackathon demo, we evaluated two candidate interactive features:
1. **Live / Normalized Comparison**: Selecting an equity and comparing its tokenized representations side-by-side against the underlying traditional equity.
2. **"What is 1 Token Worth?" Calculator**: Entering a token balance to compute the exact share-equivalent units and reference dollar value based on the underlying corporate action / dividend distribution mechanism.

This feasibility study investigated whether the required data feeds exist, whether market comparisons are economically sound, and what exact formulas must be applied without violating data integrity.

### Core Feasibility Verdict
- **Live DEX Spot Arbitrage Comparison**: **NO-GO** (Misleading due to market hours mismatch, 24/7 AMM noise, and thin BSC secondary liquidity).
- **Normalized Reference Comparison & "What is 1 Token Worth?" Calculator**: **GO — COMPARE + CALCULATOR** (Economically valid, verified data exists on BSC for Ondo and bStocks via Binance Web3 RWA API and Pyth oracles, highly educational for hackathon judges).

---

## 1. Accessible Live Data Sources & Semantic Unit Definitions

Comparing tokenized representations requires strict disambiguation of financial terms. Conflating these values leads to fictitious arbitrage signals and inaccurate claims.

```
+---------------------------------------------------------------------------------------------------------+
|                                    EQUITY & TOKEN UNIT HIERARCHY                                        |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ 1.0 Underlying Physical Share ]  <-- Custodied at Qualified Broker/Custodian (e.g. DriveWealth)      |
|              |                                                                                          |
|              +--- Stated Benchmark: [ Traditional Reference Price (USD) ] (Pyth / NASDAQ)               |
|                                                                                                         |
|  [ 1.0 Raw Token on BSC ]          <-- Stored on-chain in User EVM Wallet                                |
|              |                                                                                          |
|              +--- Accounting Factor: [ Multiplier / Scale Factor ] (Binance Web3 / Issuer Oracle)       |
|              |         |                                                                                |
|              |         +---> [ Share-Equivalent Balance ] = Raw Tokens x Multiplier                     |
|              |         +---> [ Share-Equivalent Reference Value ] = Share-Equivalent x Reference Price   |
|              |                                                                                          |
|              +--- Secondary Trading: [ Token DEX Market Price (USD) ] (PancakeSwap Pool)                |
|                        |                                                                                |
|                        +---> [ Reference Deviation ] = ((DEX Price - Ref Value per Token) / Ref Value)  |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

### Semantic Definitions

1. **Traditional Equity Reference Price ($P_{\text{ref}}$)**:
   - The official closing or real-time trading price of 1.0 underlying physical share on the primary exchange (NASDAQ / NYSE) in USD.
   - *Source*: Pyth Network `Equity.US.NVDA/USD` feed (`b1073854...`).
   - *Constraint*: Only active during US market regular hours (Mon–Fri 09:30–16:00 ET). Frozen outside market hours.

2. **Token Market Price ($P_{\text{dex}}$)**:
   - The secondary swap price of 1.0 raw token on automated market makers (e.g., PancakeSwap v3 / v2 on BSC).
   - *Source*: GeckoTerminal / DexScreener DEX indexers.
   - *Constraint*: Operates 24/7, subject to liquidity pool depth, slippage, and local market imbalances.

3. **Accounting Conversion Factor ($F_{\text{conv}}$)**:
   - The factor transforming 1.0 raw token into effective underlying share exposure.
   - *Ondo (Auto-DRIP / Scaled UI)*: `Scale Factor` ($S$).
   - *bStocks (Multiplier Model)*: `Multiplier` ($M$).
   - *xStocks (Redemption Rate)*: `Redemption Rate` ($R$).
   - *Source*: Binance Web3 RWA API (`wallet/market/token/rwa/stock/detail/list/ai`) and on-chain contract state.

4. **Share-Equivalent Units ($Q_{\text{share}}$)**:
   - The true quantity of physical shares represented by a given token balance:
     $$Q_{\text{share}} = Q_{\text{raw}} \times F_{\text{conv}}$$

5. **Share-Equivalent Reference Value ($V_{\text{ref}}$)**:
   - The aggregate intrinsic baseline value of a token holding:
     $$V_{\text{ref}} = Q_{\text{share}} \times P_{\text{ref}} = Q_{\text{raw}} \times F_{\text{conv}} \times P_{\text{ref}}$$

6. **Share-Equivalent Reference Deviation ($\Delta_{\text{dev}}$)**:
   - Percentage deviation between secondary AMM price and intrinsic share-equivalent value:
     $$\Delta_{\text{dev}} = \left( \frac{P_{\text{dex}}}{F_{\text{conv}} \times P_{\text{ref}}} - 1 \right) \times 100\%$$

---

## 2. NVDA Feasibility & Economic Unit Analysis

We conducted an empirical audit on NVIDIA (`NVDA`) across all three verified providers on BSC.

### Raw Data Audit Summary for NVDA

| Property | Ondo Finance (`NVDAon`) | bStocks (`NVDAB`) | Backed / xStocks (`NVDAx`) |
| :--- | :--- | :--- | :--- |
| **BSC Contract** | `0xa9ee28c80f960b889dfbd1902055218cba016f75` | `0x02fca66c1d1afb4e2a7884261eb00f63598a7436` | `0xc845b2894dbddd03858fd2d643b4ef725fe0849d` |
| **Token Decimals** | 18 | 18 | 18 |
| **Economic Mechanism** | Auto-DRIP (Scaled UI) | Multiplier Model (BEP-677) | Redemption Rate Tracker |
| **Binance Web3 Live Multiplier** | `1.0017152487959898` | `1.000778223752807865` | **UNAVAILABLE** (Indexed on Solana only) |
| **Binance Update Timestamp** | `1788998689203` (Active) | `1789012513889` (Active) | N/A on BSC |
| **DEX Market Price (BSC)** | \$224.4999 (PancakeSwap) | \$223.9252 (PancakeSwap) | **UNAVAILABLE** (Pool Reserve < \$300) |
| **DEX Liquidity Depth (BSC)** | \$14,007.36 (Moderate) | \$3,550,969.05 (High) | \$295.56 (Illiquid on BSC) |
| **Underlying Equity Benchmark** | \$224.15 (NASDAQ / Pyth) | \$224.15 (NASDAQ / Pyth) | \$224.15 (NASDAQ / Pyth) |

### Computational Feasibility per Provider

1. **Ondo (`NVDAon`)**:
   - **Feasibility: FULLY COMPUTABLE**.
   - With 10.0 raw tokens:
     - Effective Share Units = $10.0 \times 1.00171525 = 10.017152$ shares.
     - Reference Value = $10.017152 \times \$224.15 = \$2,245.345$.
     - Secondary DEX Value = $10.0 \times \$224.4999 = \$2,244.999$.
     - Reference Deviation = $-0.0154\%$ (trading at a near-perfect parity with reference value).

2. **bStocks (`NVDAB`)**:
   - **Feasibility: FULLY COMPUTABLE**.
   - With 10.0 raw tokens:
     - Effective Share Units = $10.0 \times 1.00077822 = 10.007782$ shares.
     - Reference Value = $10.007782 \times \$224.15 = \$2,243.244$.
     - Secondary DEX Value = $10.0 \times \$223.9252 = \$2,239.252$.
     - Reference Deviation = $-0.1779\%$ (slight 17.8 bps secondary discount relative to underlying basket).

3. **xStocks (`NVDAx`)**:
   - **Feasibility: RESTRICTED TO STATIC BASELINE ON BSC**.
   - The Backed BSC contract is an ERC-20 wrapper; Binance Web3 RWA API indexes xStocks on Solana (`CT_501`, mint `Xsc9...`).
   - Under RWA Lens strict identity isolation, we **must not** apply Solana live multipliers to BSC addresses.
   - For NVDAx on BSC, conversion factor falls back cleanly to static baseline ($1.000000$).

---

## 3. Premium / Discount vs Reference Deviation Validity

In traditional finance, "Premium / Discount to NAV" compares closed-end fund market prices against verified net asset values. In crypto RWA, naïve interfaces frequently show "Premium / Discount" calculated as:
$$\text{Naïve Prem/Disc} = \left( \frac{P_{\text{dex}}}{P_{\text{stock}}} - 1 \right) \times 100\% \quad \text{[FATALLY FLAWED]}$$

### Why Naïve Comparison Fails
1. **Dividend Multiplier Omission**: If a token has accrued $0.5\%$ in dividends ($M = 1.005$), a raw token trading at $\$225.00$ against a $\$224.00$ stock is actually trading at fair value ($\$225.00 / 1.005 = \$223.88$). Calling it a $+0.45\%$ premium is mathematically wrong.
2. **Market Hours Asynchrony**: When US equity markets are closed (nights, weekends, holidays), stock prices are frozen. Crypto DEXes continue trading based on macro crypto sentiment. Comparing 24/7 crypto quotes against frozen Friday closing prices produces "phantom premiums".
3. **Thin DEX Liquidity Noise**: On BSC pools with minimal liquidity, single retail swaps move the AMM price by several percent without representing institutional fair value.

### Approved Terminology & Display Rules
- **Prohibited Label**: "Arbitrage Spread" or "Live Market Premium" (unless verified real-time during NYSE open hours with deep pool liquidity).
- **Approved Label**: **"Share-Equivalent Reference Value"** and **"Reference Deviation"** with explicit disclosure of market open/closed status.

---

## 4. Data Freshness, Market Hours Alignment & Oracle Status

| Data Dimension | Update Frequency | Active Hours | Behavior During US Closed Hours |
| :--- | :--- | :--- | :--- |
| **Traditional Stock Price** | Sub-second (Pyth Hermes) | Mon–Fri 09:30–16:00 ET | Static (Last official closing price marked with `MARKET CLOSED` indicator) |
| **Binance Web3 Multiplier** | Real-time / Daily | 24/7/365 | Persists latest verified corporate action / dividend factor |
| **GeckoTerminal DEX Price** | 1–5 minutes | 24/7/365 | Live AMM spot rate |
| **On-Chain Contract Balance** | Per-block (3 sec on BSC) | 24/7/365 | Real-time |

---

## 5. Binance RWA & Pyth Oracle Technical Findings

1. **Binance Web3 RWA API (`/buw/wallet/market/token/rwa/stock/detail/list/ai`)**:
   - Provides public, unauthenticated access across three provider categories (`type: 1` = Ondo, `type: 2` = xStocks, `type: 3` = bStocks).
   - High data quality on BSC for Ondo (309 tokens) and bStocks (17 tokens).
   - Exact numeric multipliers provided to 18 decimal places.
2. **Pyth Network Hermes API (`https://hermes.pyth.network/v2/price_feeds`)**:
   - Publishes official market schedules (`America/New_York;0930-1600...`) and real-time equity indices.
   - Exposes dedicated tokenized equity feed identifiers (`Crypto.NVDAON/USD`, `Crypto.NVDAX/USD`).

---

## 6. Multi-Provider Overlap Candidates on BSC

Our inspection of the raw Binance dataset revealed multiple equities with verified listings across multiple providers on BSC:

| Underlying Ticker | Company / Index | Ondo (`chainId: 56`) | bStocks (`chainId: 56`) | Multiplier Divergence |
| :--- | :--- | :--- | :--- | :--- |
| **NVDA** | NVIDIA Corp | `NVDAon` ($M = 1.001715$) | `NVDAB` ($M = 1.000778$) | $9.37$ bps |
| **MSFT** | Microsoft Corp | `MSFTon` ($M = 1.005731$) | `MSFTB` ($M = 1.001314$) | $44.17$ bps |
| **QQQ** | Invesco QQQ Trust | `QQQon` ($M = 1.004082$) | `QQQB` ($M = 1.000725$) | $33.58$ bps |
| **TSLA** | Tesla, Inc. | `TSLAon` ($M = 1.000000$) | `TSLAB` ($M = 1.000000$) | $0.00$ bps (No dividend) |
| **CRCL** | Circle Internet Group | `CRCLon` ($M = 1.000000$) | `CRCLB` ($M = 1.000000$) | $0.00$ bps (No dividend) |
| **MSTR** | MicroStrategy Inc. | `MSTRon` ($M = 1.000000$) | `MSTRB` ($M = 1.000000$) | $0.00$ bps (No dividend) |

> **Key Financial Insight**: Equities without cash dividends (TSLA, CRCL, MSTR) exhibit identical multipliers ($1.000000$), whereas dividend-paying equities (NVDA, MSFT, QQQ) exhibit provider-specific multiplier accumulation based on distinct inception dates and distribution schedules.

---

## 7. Traceability Audit Matrix

```
+-------------------------------------------------------------------------------------------------------------------------+
| Output Metric                 | Upstream Source             | Upstream Field     | Fallback Behavior                    |
+-------------------------------+-----------------------------+--------------------+--------------------------------------+
| Reference Price               | Pyth Network (Hermes)       | price.price        | Stored verified equity benchmark     |
| Market Status                 | Pyth Network                | market_hours       | Offline schedule calculation (NYSE)  |
| Ondo Conversion Factor        | Binance Web3 RWA API Type 1 | data[].multiplier  | Static 1.000000 baseline             |
| bStocks Conversion Factor     | Binance Web3 RWA API Type 3 | data[].multiplier  | Static 1.000000 baseline             |
| xStocks Conversion Factor     | Binance Web3 RWA API Type 2 | data[].multiplier  | Static 1.000000 baseline (BSC)       |
| Secondary DEX Price           | GeckoTerminal BSC           | attributes.price_usd| Tagged as "Secondary Pool Stale/N/A"|
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 8. "What is 1 Token Worth?" Calculator Feasibility & Mathematical Formulas

The "What is 1 Token Worth?" calculator is fully feasible and provides unmatched educational clarity.

### Mathematical Formulation by Mechanism

#### 1. Ondo Auto-DRIP Mechanism
$$Q_{\text{display}} = Q_{\text{raw}} \times S_{\text{ondo}}$$
$$V_{\text{total}} = Q_{\text{display}} \times P_{\text{ref}}$$
$$\text{Accreted Dividend Value} = (Q_{\text{display}} - Q_{\text{raw}}) \times P_{\text{ref}}$$

#### 2. bStocks Dynamic Multiplier Mechanism
$$Q_{\text{effective\_shares}} = Q_{\text{raw}} \times M_{\text{bstocks}}$$
$$V_{\text{total}} = Q_{\text{effective\_shares}} \times P_{\text{ref}}$$
$$\text{Multiplier Value Uplift} = Q_{\text{raw}} \times (M_{\text{bstocks}} - 1) \times P_{\text{ref}}$$

#### 3. xStocks Continuous Redemption Rate Mechanism
$$Q_{\text{cert\_shares}} = Q_{\text{raw}} \times R_{\text{xstocks}}$$
$$V_{\text{total}} = Q_{\text{cert\_shares}} \times P_{\text{ref}}$$

---

## 9. Historical Factor Evolution & Divergence Feasibility

- **Current State**: Binance Web3 RWA API returns the latest snapshot `multiplier` and `lastUpdateTime`.
- **Historical Tracking**: Historical multiplier time series are not published in the single REST endpoint, but can be accumulated over time by recording snapshots on every query or pulling on-chain event logs.
- **Feasibility Verdict**: Snapshot comparison is 100% production-ready today; continuous historical charting should be deferred to a post-hackathon phase.

---

## 10. API Playground & MCP Integration Feasibility

The calculator and comparison data models can be seamlessly exposed via:
1. **RWA Lens REST API**:
   - `GET /api/lens/compare/{ticker}`: Returns normalized cross-representation comparison matrix.
   - `POST /api/lens/calculate`: Accepts `{ ticker, providerId, amount }` and returns exact share-equivalent breakdowns.
2. **RWA Lens MCP Tools**:
   - `calculate_token_value`: Computes share-equivalent exposure and reference value for AI agents.
   - `compare_representations`: Compares token structures, mechanisms, and live conversion factors.

---

## 11. Recommended Interaction Architecture & UI-Ready Data Model

### Proposed Interactive Component: `TokenValueCalculator` & `NormalizedCompareCard`

```typescript
export interface TokenCalculationResult {
  readonly ticker: string;
  readonly providerId: ProviderId;
  readonly tokenSymbol: string;
  readonly rawTokenAmount: number;
  readonly accountingFactor: number;
  readonly factorName: "Scale Factor" | "Multiplier" | "Redemption Rate" | "Static Ratio";
  readonly shareEquivalentUnits: number;
  readonly referencePriceUSD: number;
  readonly totalReferenceValueUSD: number;
  readonly mechanismAccretionUSD: number;
  readonly marketStatus: "OPEN" | "CLOSED";
  readonly dexMarketPriceUSD?: number;
  readonly referenceDeviationPercent?: number;
  readonly provenance: EvidenceRecord;
}
```

---

## 12. Risks, Limitations & Integrity Safeguards

1. **No False Arbitrage Claims**: The UI must explicitly state that secondary DEX prices differ from share-equivalent reference values due to liquidity depth, fee tiers, and market closure.
2. **Chain Isolation**: Solana multipliers must never be attached to BSC contracts.
3. **Graceful Fallback**: When live factors or DEX liquidity are unavailable, the interface must display clear fallback badges (`Static 1.0 Baseline`, `DEX Liquidity Unavailable`) rather than zeros or fabricated numbers.

---

## 13. Final Recommendation

```
+=============================================================================+
|                           FINAL RECOMMENDATION                              |
+=============================================================================+
|                                                                             |
|                     GO — COMPARE + CALCULATOR                               |
|                                                                             |
|  Implement a unified "Normalized Comparison & Value Calculator" module:      |
|  1. Normalized Representation Comparison against Underlying Reference Data  |
|  2. Interactive "What is 1 Token Worth?" Mechanism Calculator                |
|                                                                             |
+=============================================================================+
```

### Rationale
- The required live data (Binance Web3 RWA multipliers, Pyth reference feeds, GeckoTerminal prices) exists, has been verified on BSC, and is already integrated into the RWA Lens backend.
- The "What is 1 Token Worth?" calculator directly demonstrates why TickerKin is necessary: 1 token does *not* equal 1 share in the real world due to Auto-DRIP and Multipliers.
- It delivers high hackathon demo impact within seconds while maintaining 100% mathematical and data integrity.
