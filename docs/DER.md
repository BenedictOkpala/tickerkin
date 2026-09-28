# Developer Experience Report (DER)

## Entry 1: Phase 1 Provider Discovery (NVDA)
**Date:** 2026-09-27  
**Summary:** Initial investigation into tokenized stocks on BNB Smart Chain across Ondo, bStocks, xStocks, and Pyth oracles.

---

## Entry 2: Phase 1.5 Evidence & Architecture Audit
**Date:** 2026-09-27  
**Summary:** Rigorous evidence classification distinguishing first-party/on-chain facts from indexer inferences. Identified the total-return / multiplier model nuances across bStocks, Ondo, and Backed/xStocks.

---

## Entry 3: Phase 2 Core Engine Implementation
**Date:** 2026-09-28  
**Subject:** Implementation of the normalized domain model, provider adapters, verified registry, and lookup engine.

### 1. What We Implemented
- Designed the type-safe TypeScript domain model under `src/types/`:
  - `provenance.ts`: `EvidenceClass` (`FIRST_PARTY`, `ON_CHAIN`, `ORACLE`, `THIRD_PARTY`, `INFERRED`, `UNKNOWN`) and `EvidenceRecord`.
  - `economic.ts`: Discriminated union for `EconomicModel` (`BStocksMultiplierModel`, `XStocksRedemptionRateModel`, `OndoAutoDripScaledModel`, `GenericEconomicModel`).
  - `price.ts`: Disambiguates `TRADITIONAL_EQUITY_REFERENCE`, `TOKEN_NAV`, and `DEX_MARKET_PRICE`.
  - `equity.ts`: Underlying equity descriptor with market hours from Pyth.
  - `token.ts`: Normalized tokenized representation.
  - `lens.ts`: Strongly typed results for `lookupByTicker` and `lookupByContract`.
- Implemented isolated provider adapters:
  - `OndoProviderAdapter` (`src/providers/ondo/index.ts`)
  - `BStocksProviderAdapter` (`src/providers/bstocks/index.ts`)
  - `XStocksProviderAdapter` (`src/providers/xstocks/index.ts`)
  - `BnbOracleAdapter` (`src/providers/bnb/index.ts`)
- Created the curated `VERIFIED_REGISTRY` (`src/lens/registry.ts`) strictly admitting verified assets (`NVDA` across all 3 providers, `AAPL`/`TSLA` for Ondo) while rejecting unverified candidate contracts.
- Built the `RWALensEngine` (`src/lens/engine.ts`) supporting case-insensitive lookups, address normalization, EVM address validation, and structured error responses.
- Added comprehensive automated unit tests (`tests/engine.test.ts`) executed via Vitest.

### 2. Engineering Observations & Experience
- **Preserving Mechanism Differences vs. Monolithic Schemas**:
  - The temptation in multi-asset systems is to flatten all tokens into a simple numeric `sharesPerToken = 1.0`. However, doing so would hide critical differences (e.g. bStocks' 30% withholding tax on dividend reinvestment, xStocks' `.RR` rate updates, Ondo's Scaled UI).
  - Using a discriminated union on `economicModel.mechanism` proved clean in TypeScript, allowing consumers to switch on the mechanism type safely while accessing common fields directly.
- **Strict Provenance Attachment**:
  - Attaching `provenance` records directly to representations and underlying assets makes debugging transparent: developers can immediately see whether a contract was verified via `ON_CHAIN` RPC call or an `ORACLE` feed.
- **Vitest Integration**:
  - Adding `vitest` with `@/*` path alias support via `vitest.config.mjs` executed all 16 unit tests in 12ms without touching or bloating production Next.js dependencies.

### 3. Testing & Verification Results
- 16/16 unit tests passed.
- TypeScript typecheck passed with 0 errors (`tsc --noEmit`).
- ESLint passed with 0 warnings/errors.
- Next.js production build succeeded with static page generation.
