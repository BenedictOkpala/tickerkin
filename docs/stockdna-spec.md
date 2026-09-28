# StockDNA — Product & UI Architecture Specification

> **Version:** 1.0.0  
> **Status:** Approved for Phase 4B Implementation  
> **Author:** RWA Lens Product & Architecture Team  
> **Target Audience:** Hackathon Judges, Web3 Developers, DeFi Protocol Integrators

---

## 1. StockDNA Product Statement

**StockDNA** is the consumer-facing visual interface built directly on top of the **RWA Lens** normalization engine. 

While **RWA Lens** acts as the canonical data and verification infrastructure on BNB Smart Chain, **StockDNA** translates this data into a spatial, interactive identity map that answers a single essential question:

> *"What tokenized versions of this traditional stock exist on BNB Smart Chain, and how do their mechanics, issuers, and legal protections actually differ?"*

StockDNA does not masquerade as a trading terminal or a generic crypto price dashboard. It is an **identity explorer, structural comparison tool, and developer-grade verification interface**.

---

## 2. Primary User Journey

The end-to-end user journey follows a single, high-clarity mental model:

```text
[ 1. SEARCH / DISCOVERY ]
       │  (User enters "NVDA" or pastes "0xa9ee28...6f75")
       ▼
[ 2. RESOLUTION ]
       │  (Calls /api/lens/ticker/:ticker or /api/lens/contract/:address)
       ▼
[ 3. UNDERLYING IDENTITY ]
       │  (Displays verified traditional equity identity: NASDAQ: NVDA)
       ▼
[ 4. SPATIAL DNA VISUALIZATION ]
       │  (Central node branches into verified provider representations)
       ▼
[ 5. REPRESENTATION EXPLORATION ]
       │  (Side-by-side inspection: Ondo NVDAon, bStocks NVDAB, xStocks NVDAx)
       ▼
[ 6. ECONOMIC MECHANISM DRILL-DOWN ]
       │  (Auto-DRIP vs Multiplier vs Redemption Rate comparison)
       ▼
[ 7. PROVENANCE & RAW LENS DATA ]
          (Inspect on-chain proof, oracle feed IDs, and canonical JSON)
```

---

## 3. Information Architecture

Information is organized across five strict disclosure levels:

- **Level A — Underlying Equity Anchor**: Traditional stock symbol (`NVDA`), legal corporation name (`NVIDIA Corporation`), exchange listing (`NASDAQ`), quote currency (`USD`), and traditional market schedule status via Pyth oracles.
- **Level B — Tokenized Representation Badges**: Distinct cards for each verified issuer on BNB Smart Chain (`Ondo`, `bStocks`, `xStocks`), token tickers (`NVDAon`, `NVDAB`, `NVDAx`), token standards (`BEP-20`), and contract addresses.
- **Level C — Economic & Accounting Mechanics**: Differentiates how total return and corporate actions are handled (Ondo Scaled UI DRIP vs bStocks Multiplier scaling vs xStocks `.RR` tracker certificate).
- **Level D — Evidence & Provenance**: Source classifications (`ON_CHAIN`, `ORACLE`, `FIRST_PARTY`), confidence tiers (`HIGH`), and verification references.
- **Level E — Raw Lens Engine Data**: Developer slide-over drawer exposing the unaltered canonical JSON response from `/api/lens`.

---

## 4. Desktop Layout & Wireframe

### Visual Direction
- **Foundation**: Deep technical dark slate (`#0B0E14` foundation, `#151B26` cards).
- **Accents**: Warm amber/gold highlight (`#F0B90B` inspired by BNB Chain) balanced with crisp electric cyan for on-chain verification accents (`#00F0FF`).
- **Typography**: Clean monospace for contracts and identifiers; crisp modern sans-serif (`Inter` / system-ui) for interface labels.

### Desktop Wireframe (ASCII)

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│  [Logo] StockDNA                    [Search: "NVDA" or "0x..."       ] [View API]│
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                            ┌───────────────────────┐                             │
│                            │    UNDERLYING EQUITY  │                             │
│                            │   NVIDIA Corporation  │                             │
│                            │  NASDAQ: NVDA  [USD]  │                             │
│                            │  ● Market Hours: US   │                             │
│                            └───────────┬───────────┘                             │
│                                        │                                         │
│                      ┌─────────────────┼─────────────────┐                       │
│                      │                 │                 │                       │
│             [ Branch A ]         [ Branch B ]      [ Branch C ]                  │
│                      │                 │                 │                       │
│         ┌────────────▼─────────┐ ┌─────▼────────────┐ ┌──▼───────────────────┐   │
│         │     ONDO FINANCE     │ │  BINANCE bSTOCKS │ │   xSTOCKS / BACKED   │   │
│         ├──────────────────────┤ ├──────────────────┤ ├──────────────────────┤   │
│         │ Symbol: NVDAon       │ │ Symbol: NVDAB    │ │ Symbol: NVDAx        │   │
│         │ Token: BEP-20 (18d)  │ │ Token: BEP-20    │ │ Token: BEP-20 (18d)  │   │
│         │ Contract: 0xa9ee...  │ │ Contract: 0x02.. │ │ Contract: 0xc845...  │   │
│         ├──────────────────────┤ ├──────────────────┤ ├──────────────────────┤   │
│         │ ECONOMIC MECHANISM   │ │ ECONOMIC MECHAN. │ │ ECONOMIC MECHANISM   │   │
│         │ Auto-DRIP (Scaled UI)│ │ Multiplier Model │ │ Redemption Rate Cert │   │
│         │ Net Div Reinvestment │ │ Raw × Multiplier │ │ Continuous .RR Feed  │   │
│         ├──────────────────────┤ ├──────────────────┤ ├──────────────────────┤   │
│         │ PROVENANCE: ON-CHAIN │ │ PROVENANCE: ON-C │ │ PROVENANCE: ON-CHAIN │   │
│         │ [ Copy ]  [ Inspect ]│ │ [ Copy ] [ Insp ]│ │ [ Copy ]  [ Inspect ]│   │
│         └──────────────────────┘ └──────────────────┘ └──────────────────────┘   │
│                                                                                  │
│──────────────────────────────────────────────────────────────────────────────────│
│  [ Evidence Drawer: 3 verified on-chain representations | Engine: RWA Lens v0.1] │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mobile Layout & Wireframe

On mobile devices (screens `< 768px`), the spatial branch is transformed into a **Vertical DNA Spine**:

### Mobile Wireframe (ASCII)

```text
┌────────────────────────────────────────┐
│  StockDNA                [ ≡ Menu ]    │
├────────────────────────────────────────┤
│  [ Search: "NVDA" or "0x..."       ]   │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  UNDERLYING: NVIDIA CORP (NVDA)  │  │
│  │  NASDAQ | USD | Market: US Hours │  │
│  └──────────────────┬───────────────┘  │
│                     │                  │
│                     ▼ [DNA Spine]      │
│  ┌──────────────────────────────────┐  │
│  │  1. ONDO FINANCE (NVDAon)        │  │
│  │  • BEP-20: 0xa9ee...6f75 [Copy]  │  │
│  │  • Mechanism: Auto-DRIP Scaled   │  │
│  │  • Status: Active | On-Chain     │  │
│  └──────────────────┬───────────────┘  │
│                     │                  │
│                     ▼                  │
│  ┌──────────────────────────────────┐  │
│  │  2. BINANCE bSTOCKS (NVDAB)      │  │
│  │  • BEP-20: 0x02fc...7436 [Copy]  │  │
│  │  • Mechanism: Multiplier Model   │  │
│  │  • Status: Active | On-Chain     │  │
│  └──────────────────┬───────────────┘  │
│                     │                  │
│                     ▼                  │
│  ┌──────────────────────────────────┐  │
│  │  3. xSTOCKS / BACKED (NVDAx)     │  │
│  │  • BEP-20: 0xc845...849d [Copy]  │  │
│  │  • Mechanism: Redemption Rate    │  │
│  │  • Status: Active | On-Chain     │  │
│  └──────────────────────────────────┘  │
│                                        │
│  [ { } View Raw Lens API Response ]    │
└────────────────────────────────────────┘
```

---

## 6. DNA Visualization Design

The DNA identity map visualizes the one-to-many relationship:
1. **Underlying Anchor Node**: Positioned at top-center (desktop) or top of the stack (mobile). Features a distinct corporate asset badge, NASDAQ ticker, and verified Pyth oracle schedule status.
2. **Dynamic Connector Rays**: Subtle SVG connection paths connect the underlying node to each verified representation.
3. **Provider Branch Cards**: Each card sits at the terminus of its connector ray, with visual hierarchy prioritizing:
   - Provider brand & legal entity (`Ondo Global Markets`, `Binance Affiliate`, `Backed Finance`)
   - Token symbol badge (`NVDAon`, `NVDAB`, `NVDAx`)
   - Economic mechanism pill (`Auto-DRIP`, `Multiplier`, `Redemption Rate`)
   - BSC Contract Address (with 1-click clipboard copy & explorer link)

---

## 7. Search Interaction

### Supported Queries
- **Traditional Tickers**: e.g., `NVDA`, `nvda`, `AAPL`, `TSLA`.
- **Contract Addresses**: e.g., `0xa9ee28c80f960b889dfbd1902055218cba016f75`.

### Quick Select Chips
The search input presents quick-select pills for pre-verified assets:
- `[ NVDA ]` (3 Verified Providers — Flagship Demo)
- `[ AAPL ]` (Ondo Verified)
- `[ TSLA ]` (Ondo Verified)

### Search States
- **Idle**: Clean search bar with asset pill shortcuts and descriptive helper text.
- **Loading**: Subtle pulse animation on connector rays with skeleton card previews.
- **Success**: Smooth expansion of underlying anchor and representation cards.
- **Error (TICKER_NOT_FOUND / CONTRACT_NOT_FOUND)**: Friendly, non-blocking error container explaining that the asset is not yet verified in the RWA Lens registry, offering quick buttons back to `NVDA`.
- **Error (INVALID_ADDRESS)**: Immediate client-side validation indicating malformed hex address.

---

## 8. Representation Card Design

Each card encapsulates a complete verified token profile:

```text
┌──────────────────────────────────────────────────────────┐
│  ONDO FINANCE                            [ VERIFIED ✓ ]  │
│  Issuer: Ondo Global Markets                             │
├──────────────────────────────────────────────────────────┤
│  NVDAon                                  BEP-20 • 18 Dec │
│  NVIDIA (Ondo Tokenized)                                 │
├──────────────────────────────────────────────────────────┤
│  Contract Address                                        │
│  0xa9ee28c80f960b889dfbd1902055218cba016f75    [ ⧉ Copy ]│
├──────────────────────────────────────────────────────────┤
│  Economic Model: Auto-DRIP (Scaled UI)                   │
│  • Automatic dividend reinvestment net of withholding    │
│  • Token price tracks NAV                                │
├──────────────────────────────────────────────────────────┤
│  Provenance: ON_CHAIN (Confidence: HIGH)                 │
│  Primary DEX: PancakeSwap                                │
└──────────────────────────────────────────────────────────┘
```

---

## 9. Economic-Mechanism Presentation

StockDNA visually explains how provider mechanics diverge without defaulting unpolled values to fake numbers:

| Provider | UI Mechanism Title | Visual Explanation | Formula / Parameter Display |
|---|---|---|---|
| **Ondo** | **Auto-DRIP / Scaled UI** | Dividends are automatically reinvested into the underlying security. On BSC, balances update via Scaled UI. | `Token Price Tracks NAV (100% Asset Backed)` |
| **bStocks** | **BEP-677 Multiplier** | Adjusts effective balance for dividends and stock splits through an on-chain multiplier factor. | `Effective = Raw Balance × Multiplier` *(Live Multiplier: Polled On-Chain)* |
| **xStocks** | **Redemption Rate Tracker** | Tracks total return via an evolving certificate redemption rate feed published by Pyth. | `Rate Feed: Crypto.NVDAX/NVDA.RR` |

---

## 10. Provenance / Evidence Interaction

Progressive disclosure ensures casual users are not overwhelmed while allowing auditors to verify every claim:
- **Default View**: A compact badge on each card: `[ ON_CHAIN ✓ ]`, `[ ORACLE ⚡ ]`, `[ FIRST_PARTY 🏛 ]`.
- **Expanded Detail Drawer**: Clicking **"Inspect Evidence"** opens a drawer detailing:
  - Evidence Class & Confidence Rating
  - Source Verification Method (`Direct eth_call on BSC node: https://bsc.publicnode.com`)
  - Primary Issuer Documentation Reference Link
  - BSC Block Explorer Verification Link

---

## 11. Raw Lens Data Interaction

A floating developer control labeled **`{ } View Lens Data`** opens a sliding code panel displaying the exact normalized JSON returned by the RWA Lens engine for the active lookup:
- Formatted with syntax highlighting.
- 1-click **Copy JSON** button.
- Direct cURL snippet showing the corresponding `/api/lens/ticker/:ticker` or `/api/lens/contract/:address` call.

---

## 12. Loading, Empty, and Error States

1. **Loading State**:
   - Connector paths pulse with a subtle cyan glow.
   - 3 skeleton representation cards shimmer while awaiting API response.
2. **Empty / Welcome State**:
   - Headline: *"Explore Tokenized Equities on BNB Smart Chain"*.
   - Explanatory bullet points and 3 clickable flagship demo pills (`NVDA`, `AAPL`, `TSLA`).
3. **Unsupported Ticker State (404)**:
   - Clear alert: *"No verified representations found for ticker 'XYZ'"*.
   - Explains that RWA Lens excludes unverified community contracts for investor safety.
4. **Invalid Address State (400)**:
   - Form input highlights in red with message: *"Expected 40-character hex address starting with 0x"*.

---

## 13. Motion Principles

- **Entrance Transitions**: Underlying node fades and scales in first (150ms), followed by sequential staggered slide-in of representation cards (75ms delay per card).
- **Connector Line Glow**: Subtle animated dash offset on SVG branch lines simulating data flowing from the underlying equity to the tokens.
- **Reduced Motion (`prefers-reduced-motion: reduce`)**: Automatically disables SVG line animations and replaces staggered slide-ins with immediate opacity transitions.

---

## 14. Accessibility (a11y) & Usability

- **High Contrast**: Minimum 4.5:1 contrast ratio across all text and badges on dark backgrounds.
- **Full Keyboard Navigation**:
  - `Tab` / `Shift+Tab` cycles cleanly through Search Bar -> Asset Chips -> Representation Cards -> Copy Buttons -> Lens Data Drawer.
  - `Esc` closes any active drawer or modal.
- **Screen Reader Support**: All status icons pair with visually hidden ARIA labels (`aria-label="Verified On-Chain"`).
- **Clipboard Feedback**: Copying contract addresses provides immediate visual confirmation (`"Copied!"` badge change for 2 seconds).

---

## 15. Flagship NVDA Experience Walkthrough

When a hackathon judge loads StockDNA or searches `NVDA`, the first viewport communicates five key facts within 5 seconds:

1. **Underlying Corporation**: Clear top anchor showing `NVIDIA Corporation (NASDAQ: NVDA)` in USD.
2. **Verified Count**: Badge displaying *"3 Verified Tokenized Representations on BNB Smart Chain"*.
3. **Issuers Identified**: Distinct cards for `Ondo Finance`, `Binance bStocks`, and `xStocks / Backed Finance`.
4. **Mechanism Contrast**: Immediately visible comparison:
   - Ondo: *Auto-DRIP Scaled UI*
   - bStocks: *BEP-677 Multiplier*
   - xStocks: *Continuous Redemption Rate*
5. **On-Chain Evidence**: Every contract address is verified on BSC with clickable explorer links and full JSON inspectability.

---

## 16. Component Architecture Proposal

```text
src/
├── app/
│   ├── page.tsx                    (StockDNA Main Page - Shell & Search State)
│   └── layout.tsx                  (Root Layout & Metadata)
├── components/
│   └── stockdna/
│       ├── SearchHeader.tsx        (Search input, asset chips, submit handling)
│       ├── DnaGraph.tsx            (Spatial canvas containing anchor and branches)
│       ├── UnderlyingNode.tsx      (Top anchor displaying underlying equity)
│       ├── RepresentationCard.tsx  (Provider token card with economic pill)
│       ├── EconomicPill.tsx        (Specialized visual tag for mechanism type)
│       ├── ProvenanceBadge.tsx     (Source class tag with modal trigger)
│       ├── EvidenceDrawer.tsx      (Progressive disclosure drawer for audit trail)
│       ├── RawLensDrawer.tsx       (Developer JSON drawer & cURL generator)
│       ├── LoadingSkeleton.tsx     (Shimmer loading state for cards & canvas)
│       └── ErrorBanner.tsx         (Structured error feedback for 400/404)
└── hooks/
    └── useStockDna.ts              (Client hook querying /api/lens endpoints)
```

---

## 17. API-to-Component Data Flow

```text
[ User Input: "NVDA" ]
         │
         ▼
[ useStockDna Hook ] ───► HTTP GET /api/lens/ticker/NVDA
                                   │
                                   ▼
                       [ Next.js API Route Handler ]
                                   │
                                   ▼
                       [ rwaLens.lookupByTicker() ]
                                   │
                                   ▼
                       [ JSON Response Envelope ]
                       { ok: true, data: { underlying, representations } }
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
[ UnderlyingNode.tsx ]                             [ RepresentationCard.tsx ]
• ticker, name, exchange                           • providerId, tokenSymbol
• marketHours, provenance                          • contractAddress, decimals
                                                   • economicModel, marketInfo
```

---

## 18. What NOT to Build in Phase 4B

To maintain rigorous technical integrity and scope discipline:
- ❌ **NO Fake Live Stock/Crypto Prices**: We will not display mock green/red price ticks.
- ❌ **NO Swap / Trading UI**: No fake "Buy/Sell" or DEX routing buttons.
- ❌ **NO Wallet Connect**: No Web3 wallet modal or transaction signing.
- ❌ **NO Artificial Charting**: No fake TradingView candlestick widgets.
- ❌ **NO Fabricated Multipliers**: Dynamic unpolled numbers will remain gracefully unrendered.

---

## 19. Phase 4B Implementation Sequence

1. **Step 1 — Hook & API Integration**: Implement `useStockDna` hook executing typed `fetch` calls to `/api/lens/ticker/:ticker` and `/api/lens/contract/:address`.
2. **Step 2 — Search & Header Components**: Implement `SearchHeader` with keyboard submission and `NVDA`/`AAPL`/`TSLA` quick pills.
3. **Step 3 — Underlying & Representation Cards**: Build `UnderlyingNode`, `RepresentationCard`, and `EconomicPill` components.
4. **Step 4 — Spatial DNA Graph & SVG Connectors**: Assemble `DnaGraph` with responsive desktop spatial branches and mobile vertical spine.
5. **Step 5 — Drawers & Inspectability**: Add `EvidenceDrawer` and `RawLensDrawer` (`{ } View Lens Data`).
6. **Step 6 — Responsive Styling & a11y**: Refine Tailwind/CSS dark palette, contrast, and focus states.
7. **Step 7 — Verification Suite**: Add UI unit tests, verify `npm test`, `typecheck`, `lint`, and `build`.
