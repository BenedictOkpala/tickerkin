# Developer Experience Report (DER)

## Entry 1: Phase 1 Provider Discovery (NVDA)
**Date:** 2026-09-27  
**Summary:** Initial investigation into tokenized stocks on BNB Smart Chain across Ondo, bStocks, xStocks, and Pyth oracles.

---

## Entry 2: Phase 1.5 Evidence & Architecture Audit
**Date:** 2026-09-27  
**Summary:** Rigorous evidence classification distinguishing first-party/on-chain facts from indexer inferences. Identified total-return and multiplier model nuances across bStocks, Ondo, and Backed/xStocks.

---

## Entry 3: Phase 2 Core Engine Implementation
**Date:** 2026-09-28  
**Summary:** Implementation of the normalized domain model, provider adapters, verified registry, and lookup engine. 16/16 unit tests passed.

---

## Entry 4: Phase 2.1 Data Integrity Audit
**Date:** 2026-09-28  
**Summary:** Eliminated placeholder default values (e.g. fake `1.0` multipliers) and ensured dynamic variables are returned as `undefined` when live polling is unperformed.

---

## Entry 5: Phase 3 Public HTTP API Exposure
**Date:** 2026-09-28  
**Subject:** Exposing the normalization engine through lightweight Next.js App Router API endpoints (`/api/lens`, `/api/lens/ticker/:ticker`, `/api/lens/contract/:address`).

### 1. What We Implemented
- Created standard API response helpers (`src/lib/api-response.ts`) supporting a consistent envelope `{ ok: true, data }` and `{ ok: false, error: { code, message } }`.
- Implemented three thin route handlers:
  - `GET /api/lens` (`src/app/api/lens/route.ts`): Service discovery, supported providers, and dynamically populated supported tickers.
  - `GET /api/lens/ticker/[ticker]` (`src/app/api/lens/ticker/[ticker]/route.ts`): Ticker lookup wrapping `lookupByTicker()`.
  - `GET /api/lens/contract/[address]` (`src/app/api/lens/contract/[address]/route.ts`): Contract reverse lookup wrapping `lookupByContract()`.
- Created comprehensive API tests (`tests/api.test.ts`) covering 12 test cases with full route invocation, status code assertions, and JSON serialization validation.
- Performed live manual smoke testing against a running local Next.js server on port 3005 (`scripts/smoke-test.mjs`), validating all 6 endpoint scenarios against actual HTTP responses.

### 2. Engineering Observations & Experience
- **Thin Route Handlers**:
  - By strictly delegating all lookup logic to `src/lens/engine.ts`, the Next.js route handlers are under 35 lines of code each, completely avoiding code duplication between the core library and the HTTP layer.
- **HTTP Status Mapping**:
  - Mapped typed domain errors to clear HTTP status codes:
    - Malformed contract format -> `400 Bad Request` (`INVALID_ADDRESS`).
    - Valid ticker/contract not present in verified registry -> `404 Not Found` (`TICKER_NOT_FOUND` / `CONTRACT_NOT_FOUND`).
    - Valid lookup -> `200 OK`.
- **JSON Serialization & Data Integrity**:
  - Verified that TypeScript `undefined` properties (such as `currentMultiplier` when unpolled) are cleanly omitted from JSON payloads rather than serializing as placeholder floats or `null`.
- **Caching Headers**:
  - Set `Cache-Control: public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400` on static registry endpoints to optimize edge performance while serving deterministic results.

### 3. Verification & Smoke Test Results
- 28/28 unit and API tests passing in Vitest.
- Live HTTP smoke test passed with 100% accuracy across 6 endpoints.
- TypeScript typecheck and ESLint passed with 0 warnings/errors.
- Next.js production build succeeded with static discovery and dynamic route generation.

---

## Entry 6: Phase 4B StockDNA Frontend Visual Explorer Implementation
**Date:** 2026-09-28  
**Subject:** Building the StockDNA visual decomposition interface on top of the RWA Lens public API.

### 1. What We Implemented
- **Pure CSS Design System (`src/app/globals.css`)**: Built a customized institutional dark theme utilizing CSS variables inspired by Gambit/BNB palette (`#07090E` base, `#F0B90B` BNB gold, `#00F0FF` cyan accents, glassmorphic surfaces, SVG pulsing animations, and accessibility-compliant reduced motion).
- **Client Query Hook (`src/hooks/useStockDna.ts`)**: Built a dedicated hook handling address vs ticker format auto-detection, REST API consumption (`/api/lens/ticker/:ticker` and `/api/lens/contract/:address`), loading lifecycle, caching, and structured error propagation.
- **StockDNA Component Tree**:
  - `SearchHeader.tsx`: Unified search bar with real-time input mode detection (Ticker vs EVM Contract) and instant quick-select chips (`NVDA`, `AAPL`, `TSLA`, and a live contract example).
  - `DnaGraph.tsx` & `UnderlyingNode.tsx`: Responsive spatial branching canvas depicting the 1-to-N relationship from the traditional equity origin to tokenized implementations with live animated SVG connecting branches.
  - `RepresentationCard.tsx` & `EconomicPill.tsx`: Comprehensive token representation cards displaying BEP-20 metadata, issuer verification, 1-click clipboard address copying, BscScan explorer links, and mechanism pills contrasting Auto-DRIP vs Multiplier vs Redemption Rate mechanics.
  - `ProvenanceBadge.tsx` & `EvidenceDrawer.tsx`: Slide-over audit trail detailing data sources (On-Chain RPC, Pyth Oracle Hermes, official issuer registries) and confidence tiers.
  - `RawLensDrawer.tsx`: Embedded JSON inspector allowing developers to inspect the exact normalized RWA Lens response payload.
  - `LoadingSkeleton.tsx` & `ErrorBanner.tsx`: Shimmer loading skeleton and clear error cards for invalid queries and unverified contracts.
  - `src/app/page.tsx`: Main page shell wiring all components into a cohesive, production-grade interface.
- **UI Test Suite (`tests/ui.test.ts`)**: Added 5 unit tests validating client address detection, casing handling, and payload contract integrity.

### 2. Engineering Observations & Experience
- **Zero Frontend Data Duplication**:
  - The UI does not bundle a redundant static registry. All data flows exclusively through the Next.js API endpoints (`/api/lens`), ensuring consistent verification and business logic.
- **Data Integrity in Presentation**:
  - Adhered strictly to Phase 2.1 findings: dynamic values (multipliers and redemption rates) that are not actively polled on-chain are clearly labeled as `"Live value: Polled on-chain"` / `"Live rate: Polled via Oracle"` rather than displaying fabricated placeholder floats (`1.0`).
- **Responsive Layout & Accessibility**:
  - The DNA graph cleanly transitions from a multi-column spatial branching layout on desktop (`min-width: 1024px`) to a streamlined vertical timeline card stack on mobile viewports.
- **Full Test Suite & Build Green**:
  - Vitest suite expanded to 33 passing tests (3 test files: `engine.test.ts`, `api.test.ts`, `ui.test.ts`).
  - Next.js production build (`next build`) compiles without errors or warnings.

---

## Entry 7: Phase 4C TickerKin Brand & Visual Redesign
**Date:** 2026-09-28  
**Subject:** Rebranding consumer interface to TickerKin, designing "The Kin Map" signature visual, and refining typography and color hierarchy.

### 1. What We Implemented
- **Product Rebranding**:
  - Rebranded consumer interface from StockDNA to **TickerKin** ("Trace an equity across its verified tokenized representations") while preserving the underlying **RWA Lens Engine** architecture.
- **Restrained Dark Financial Intelligence System (`src/app/globals.css`)**:
  - Replaced high-contrast neon cyan aesthetic with a focused electric slate cobalt brand accent (`#4E75FF`), near-black background (`#0A0C10`), elevated graphite surfaces (`#11141A`, `#161A22`), restrained borders (`#28303E`), and crisp typography (`#F0F3F7`).
  - BNB Yellow (`#F0B90B`) used sparingly only where chain affiliation is relevant.
- **The Kin Map Signature Visual (`src/components/stockdna/DnaGraph.tsx`)**:
  - Implemented desktop multi-way SVG branching connecting the traditional equity root node directly into provider cards (`Ondo`, `bStocks`, `xStocks`).
  - Implemented mobile vertical lineage connector with connected trunk line and branch nodes.
- **Refined Provider & Mechanism Presentation**:
  - Updated bStocks economic copy to "Multiplier model" with clear explanation, removing unsupported "BEP-677" claims.
  - Replaced unpolled dynamic placeholders with truthful copy: `"Live factor not loaded"` and `"Live redemption rate not loaded"`.
  - Removed DEX trading clutter from primary token cards.
  - Enabled sibling family resolution on contract reverse lookup.
- **Compact Application Header (`src/components/stockdna/SearchHeader.tsx`)**:
  - Replaced oversized marketing hero with an institutional application header featuring real-time input mode detection and quick-select buttons.

### 2. Verification & Quality Gates
- Vitest suite: 35/35 passing tests across 3 test files (`tests/engine.test.ts`, `tests/api.test.ts`, `tests/ui.test.ts`).
- TypeScript (`tsc --noEmit`): Exited with 0 errors.
- ESLint (`next lint`): Exited with 0 warnings/errors.
- Production build (`next build`): Compiled 5 routes cleanly.
- Visual inspection smoke test (`scripts/visual-inspect.mjs`): 9/9 assertions passed.

---

## Entry 8: Phase 4D TickerKin Light Visual Polish
**Date:** 2026-09-28  
**Subject:** Transitioning TickerKin from a dark dashboard to an editorial, light financial-data explorer with refined curved SVG branches.

### 1. What We Implemented
- **Light Editorial Palette (`src/app/globals.css`)**:
  - Implemented crisp off-white background (`#F8F9FB`), white elevated card surfaces (`#FFFFFF`), dark navy/charcoal primary typography (`#0F172A`), muted neutral secondary typography (`#475569`, `#64748B`), and subtle borders (`#E8ECF2`, `#D9DFE8`).
  - Consolidated interactive and branch styling around a single refined cobalt slate accent (`#1A56DB`).
  - Strictly limited BNB Yellow (`#B48500`) to ecosystem chain badges.
- **Curved SVG Kin Map Geometry (`src/components/stockdna/DnaGraph.tsx`)**:
  - Replaced rigid 90-degree lines with smooth cubic bezier SVG paths (`d="M 500 0 C 500 28, ..."`), cleanly routing from the central root junction to the representation cards.
  - Retained the responsive mobile vertical lineage rail for narrow viewports (< 880px).
- **Scale & Vertical Proportion**:
  - Expanded content max-width to `1320px` and refined card padding to `1.35rem`, allowing the explorer to occupy desktop screens with confident proportion.
- **Light Theme Component States**:
  - Updated `EvidenceDrawer`, `RawLensDrawer`, `ErrorBanner`, and `LoadingSkeleton` to crisp light theme treatments.
- **Automated Verification Suite (`tests/visual.test.ts`)**:
  - Added dedicated visual verification assertions covering color tokens, typography contrast, curved SVG paths, and truthful unpolled messaging.

### 2. Verification & Quality Gates
- Vitest suite: 46/46 passing tests across 4 test files (`tests/engine.test.ts`, `tests/api.test.ts`, `tests/ui.test.ts`, `tests/visual.test.ts`).
- TypeScript (`tsc --noEmit`): Exited with 0 errors.
- ESLint (`next lint`): Exited with 0 warnings/errors.
- Production build (`next build`): Compiled 5 routes cleanly.
- Visual inspection script (`scripts/visual-inspect.mjs`): 9/9 checks passed.

---

## Entry 9: Phase 5A Binance Web3 RWA Data API Discovery & Audit
**Date:** 2026-09-29  
**Subject:** Investigating official Binance Web3 RWA endpoints, querying real live datasets, and performing schema mapping against RWA Lens.

### 1. What We Investigated & Discovered
- **Official Public Endpoint Located:**  
  `https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai`
  - Leveraged natively by Binance Web3 Wallet and the open-source `binance/binance-skills-hub` (`binance-tokenized-securities-info` skill).
  - Publicly accessible without API keys or authentication requirements for discovery and market token detail queries.
- **Provider Type Categorization in Binance Schema:**
  - `type=1`: Ondo Finance (`.on` / `on` suffix tokens, 309 records across BSC and Ethereum).
  - `type=2`: xStocks / Backed Finance (`.x` / `x` suffix tokens, 60 records on Solana).
  - `type=3`: Binance bStocks (`.B` / `B` suffix tokens, 17 records on BNB Smart Chain).
- **Real NVDA Test Asset Resolution:**
  - `type=1` (Ondo on BSC): Returned `0xa9ee28c80f960b889dfbd1902055218cba016f75` (`NVDAon`, multiplier `"1.0017152487959898"`). Matches RWA Lens registry exactly.
  - `type=3` (bStocks on BSC): Returned `0x02fca66c1d1afb4e2a7884261eb00f63598a7436` (`NVDAB`, multiplier `"1.000778223752807865"`). Matches RWA Lens registry exactly.
  - `type=2` (xStocks on Solana): Returned `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh` (`NVDAx`, multiplier `"1.001701196801074"`).
- **Expanded Real BSC bStocks Discovered:**
  - Confirmed official BEP-20 contracts on BSC for: `MUB`, `CRCLB`, `NVDAB`, `SNDKB`, `TSLAB` (`0x5b1910eaad6450e50f816082aa078c41f10c292f`), `SPCXB`, `INTCB`, `EWYB`, `AMDB`, `MSTRB`, `QQQB`, `METAB`, `LITEB`, `PLTRB`, `MSFTB`, `GOOGLB`, `QCOMB`.
- **Raw Response Archives Created:**
  - Archived all raw responses under `data/raw/binance/` (`rwa-stock-list-type1-ondo.json`, `rwa-stock-list-type2-xstocks.json`, `rwa-stock-list-type3-bstocks.json`, `nvda-findings.json`, and `README.md`).

### 2. Architectural Recommendation
- **Hypothesis Validated:** Binance Web3 RWA API serves as an external data adapter/ingestion source. RWA Lens retains its role as the authoritative normalization, verification, and provenance engine, providing domain modeling (mechanisms, legal issuers, Pyth oracles) that Binance's raw list endpoint does not expose.

---

## Entry 10: Phase 5B Binance RWA Live Data Adapter & Cross-Chain Identity Resolution
**Date:** 2026-09-29  
**Subject:** Implementing the read-only Binance RWA data client, chain-aware identity matcher, non-flattening economic model enrichment, and TickerKin UI live status integration.

### 1. What We Implemented
- **Server-Side Public Client (`src/providers/binance/client.ts`)**:
  - Implemented `BinanceRwaClient` querying `/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai` with zero credentials required.
  - Added configurable timeout (3000ms `AbortSignal.timeout`) and in-memory TTL caching (60,000ms) with concurrent fetching across all provider types (`1`, `2`, `3`).
  - Added strict response validation (`isValidBinanceStockRecord`) and graceful fallback returning `[]` on HTTP error, malformed JSON, or network disconnection.
- **Strict Chain-Aware Identity Matcher (`src/providers/binance/matcher.ts`)**:
  - Enforced the Critical Integrity Rule: Never enrich a representation using ticker alone.
  - Implemented multi-parameter resolution requiring:
    1. Exact ticker match (`record.ticker === underlying.ticker`)
    2. Provider type compatibility (`type 1` $\leftrightarrow$ `ondo`, `type 2` $\leftrightarrow$ `xstocks`, `type 3` $\leftrightarrow$ `bstocks`)
    3. Chain parity (`chainId: 56` on BSC $\neq$ `CT_501` on Solana)
    4. Contract address matching (case-insensitive EVM check for BSC/ETH, exact string check for Solana)
    5. Finite positive numeric multiplier validation
- **Binance RWA Adapter & Non-Flattening Model (`src/providers/binance/adapter.ts`)**:
  - Created `BinanceRwaAdapter` as an external enrichment source, strictly separated from issuer adapters (`OndoProviderAdapter`, `BStocksProviderAdapter`, `XStocksProviderAdapter`).
  - Mapped dynamic multipliers without flattening mechanisms:
    - Ondo (`auto_drip_scaled`): Populates `currentScaleFactor` while preserving `scaledUiEnabled: true`.
    - bStocks (`multiplier`): Populates `currentMultiplier` while preserving formula `effective_balance = raw_token_balance * multiplier`.
    - xStocks (`redemption_rate`): Only populates `currentRate` when exact representation identity is verified.
  - Attached explicit `BinanceLiveEnrichment` payload with `THIRD_PARTY` provenance and match basis documentation.
- **RWA Lens Async Engine Integration (`src/lens/engine.ts`)**:
  - Added `lookupByTickerAsync` and `lookupByContractAsync` alongside existing synchronous baseline methods.
  - Updated API routes (`/api/lens/ticker/[ticker]` and `/api/lens/contract/[address]`) to serve live-enriched payloads with fallback resilience.
- **TickerKin UI Integration (`src/components/stockdna/EconomicPill.tsx` & `RepresentationCard.tsx`)**:
  - Rendered live factors (`Scale factor: 1.001715`, `Multiplier: 1.000778`) with active status indicators when matched.
  - Preserved truthful fallback messaging (`Live factor not available`) when unpolled or unmatched.
  - Added a clickable `Binance Web3 Live` badge in the card footer opening the verification evidence drawer.

### 2. Engineering Observations & Cross-Chain Identity Friction
- **The Cross-Chain Identity Problem**:
  - The flagship equity `NVDA` exists across all 3 providers and multiple blockchains (BSC, Ethereum, Solana).
  - In the Binance Web3 RWA API, xStocks records are currently indexed exclusively on Solana (`chainId: "CT_501"`, mint `Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh`), whereas RWA Lens indexes the BSC tokenized equity ecosystem (`chainId: 56`, contract `0xc845...`).
  - Naive ticker-based or provider-based matching would have erroneously enriched the BSC xStocks card with Solana mint data and rates.
  - Our chain-aware address matcher correctly identified the chain/address mismatch, resulting in `NO_MATCH`, which left the BSC xStocks representation cleanly un-enriched while successfully enriching Ondo BSC (`0xa9ee...`) and bStocks BSC (`0x02fc...`).
- **Fetch Resolution in Client Singleton**:
  - When unit-testing Next.js API route handlers with mocked `fetch`, constructing a singleton with `options.fetchFn ?? globalThis.fetch` captured `globalThis.fetch` before Vitest's `beforeEach` mock ran.
  - Solved by resolving `this.customFetchFn ?? globalThis.fetch` dynamically at call time and providing an explicit `setFetchFn` helper on `BinanceRwaClient`.

### 3. Verification & Quality Gates
- **Unit & Integration Tests**: 57/57 passing across 5 test suites (`tests/binance.test.ts`, `tests/engine.test.ts`, `tests/api.test.ts`, `tests/ui.test.ts`, `tests/visual.test.ts`).
- **TypeScript (`tsc --noEmit`)**: 0 errors.
- **ESLint (`next lint`)**: 0 warnings, 0 errors.
- **Production Build (`next build`)**: 5 routes compiled cleanly.




