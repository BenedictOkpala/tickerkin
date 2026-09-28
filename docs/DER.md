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
**Summary:** Implementation of the normalized domain model, provider adapters, verified registry, and lookup engine. 16/16 unit tests passed.

---

## Entry 4: Phase 2.1 Data Integrity Audit
**Date:** 2026-09-28  
**Subject:** Eliminating placeholder default values and clearly separating verified structural mechanisms from dynamic financial values.

### 1. What We Audited & Corrected
- **Removal of Fabricated Baseline Floats**:
  - In Phase 2, `currentMultiplier: 1.0` (bStocks) and `currentRate: 1.0` (xStocks) were defaulted when no dynamic snapshot was supplied.
  - **Correction**: Made `currentMultiplier?: number` and `currentRate?: number` strictly optional. When dynamic oracle/on-chain polling is not actively executing, the value is returned as `undefined` rather than pretending that `1.0` is a verified live financial state.
- **Auditing Withholding Tax Property**:
  - In Phase 2, `withholdingTaxRate: 0.3` was hardcoded on `BStocksMultiplierModel`. While 30% is standard statutory US withholding tax cited in documentation, it is an off-chain tax parameter (varying with treaties/jurisdictions) rather than an on-chain property of the token itself.
  - **Correction**: Removed `withholdingTaxRate` from the structural model output and relegated tax nuances to provider documentation provenance.
- **Structural vs. Dynamic Clarity**:
  - The model now cleanly distinguishes structural mechanism definitions (e.g. `formula: "effective_balance = raw_token_balance * multiplier"`, `rateFeedSymbol: "Crypto.NVDAX/NVDA.RR"`) from dynamic runtime data.

### 2. Core Takeaway
A normalization layer must never default unpolled dynamic metrics to "safe-looking" placeholder numbers (like `1.0` or `0.3`). An explicit `undefined` state preserves data integrity and prevents downstream consumers (and UI widgets) from rendering placeholder mock values as verified on-chain truth.
