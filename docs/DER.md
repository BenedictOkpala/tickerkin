# Developer Experience Report (DER)

## Entry 1: Phase 1 Provider Discovery (NVDA)
**Date:** 2026-09-27  
**Summary:** Initial investigation into tokenized stocks on BNB Smart Chain across Ondo, bStocks, xStocks, and Pyth oracles.

---

## Entry 2: Phase 1.5 Evidence & Architecture Audit
**Date:** 2026-09-27  
**Subject:** Rigorous evidence classification, distinguishing first-party/on-chain facts from indexer inferences, and resolving structural nuances.

### 1. What We Attempted
- Audited every provider claim from Phase 1 against explicit evidence tiers: `[FIRST-PARTY]`, `[ON-CHAIN]`, `[ORACLE]`, `[THIRD-PARTY]`, `[INFERRED]`, and `[UNKNOWN]`.
- Dissected the relationship between Backed Finance and xStocks (`bNVDA` vs `NVDAx`).
- Investigated corporate action mechanics, dividend handling, and the "1:1 share exposure" claim.
- Executed direct `eth_call` contract verification on BNB Smart Chain mainnet for candidate addresses across `NVDA`, `AAPL`, and `TSLA`.
- Assessed official BNB Hackathon tooling to confirm or refute RWA API redundancy.

### 2. Key Audit Findings & Corrections
- **xStocks vs. Backed Finance (`[FIRST-PARTY]` Verified)**:
  - Backed Finance (Backed Assets JE Limited) is the legal and technical issuer of xStocks.
  - "bTokens" (e.g. `bNVDA`) are Backed's legacy product line, currently being phased out in favor of "xStocks" (e.g. `NVDAx`). They are not two competing protocols; they are versions of the same issuer's product.
  - **Terminology standard for RWA Lens**: Use `xStocks` as the primary provider moniker, noting Backed Finance as the underlying issuer.
- **The "1:1" Exposure Nuance (`[FIRST-PARTY]` & `[ORACLE]` Verified)**:
  - The initial claim that tokens provide a static "1:1 share exposure" is an oversimplification.
  - All three providers operate **Total Return** models:
    - **bStocks**: Uses an on-chain Multiplier (`Raw Balance × Multiplier = Effective Balance`) that scales upward with reinvested net dividends and splits.
    - **Ondo**: Implements automatic dividend reinvestment (DRIP) reflected via token scaling on BSC or per-token price adjustments.
    - **xStocks**: Employs continuous redemption rate feeds (`.RR` feeds on Pyth) and periodic reinvestment/airdrop distributions.
  - **Architectural Impact**: RWA Lens must not model token quantity as equal to underlying share quantity. The schema must distinguish `rawTokenBalance`, `multiplierOrRate`, and `effectiveUnderlyingShares`.
- **On-Chain Verification vs. Third-Party Indexer Hallucinations (`[ON-CHAIN]` Verified)**:
  - Ondo's contracts for `NVDAon` (`0xa9ee28...`), `AAPLon` (`0x390a68...`), and `TSLAon` (`0x2494b6...`) returned confirmed BEP-20 metadata via direct RPC `eth_call`.
  - bStocks `NVDAB` (`0x02fca6...`) and xStocks `NVDAx` (`0xc845b2...`) were similarly verified on-chain.
  - **Candidate addresses from third-party search results for bStocks AAPL and TSLA failed on-chain verification** (returned empty bytecode). This demonstrates the absolute necessity of our evidence audit and highlights the dangerous fragmentation of third-party indexers.
- **BNB Hackathon Infrastructure Redundancy Audit (`[FIRST-PARTY]` Verified)**:
  - The BNB Hackathon provides temporary aggregated APIs (swap routing and market feeds via partner integrations like Binance Web3 Wallet).
  - However, it does not provide an open, standardized, cross-provider canonical RWA normalization engine or an on-chain registry mapping tickers to all issuer variants.
  - Building RWA Lens remains technically justified and directly aligned with the hackathon's objectives.

### 3. Developer Friction & Fragmentation
- Third-party indexers (CoinGecko, DexScreener) mix legacy token addresses, unverified community tokens, and unofficial wrapped variants under the same ticker names.
- Without a unified normalization layer like RWA Lens, developers are forced to manually inspect bytecode and perform multiple RPC queries to verify provider authenticity.
