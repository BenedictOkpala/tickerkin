# Provider Feature & Integration Matrix (Audited)

This matrix tracks tokenized stock providers on **BNB Smart Chain (BSC)**, with explicit evidence classification for all claims:
- **`[FIRST-PARTY]`**: Verified via official provider documentation, portal, or official announcements.
- **`[ON-CHAIN]`**: Verified via direct EVM `eth_call` queries on BNB Smart Chain mainnet RPC nodes.
- **`[ORACLE]`**: Verified via Pyth Network oracle contracts and Hermes API feeds.
- **`[THIRD-PARTY]`**: Sourced from DEX indexers (GeckoTerminal, DexScreener, CoinGecko) without first-party cryptographic confirmation.
- **`[INFERRED]`**: Logical deductions based on verified adjacent behaviors.
- **`[UNKNOWN]`**: Unverified or unconfirmed.

---

## 1. Provider Technical Infrastructure & Sources

| Category | BNB Chain Ecosystem / Oracles | Ondo Finance | xStocks (Backed Finance) | bStocks |
|---|---|---|---|---|
| **Legal Issuer / Platform** | BNB Smart Chain / Pyth Network `[FIRST-PARTY]` | Ondo Global Markets / Ondo Finance `[FIRST-PARTY]` | Backed Assets (JE) Limited / Kraken `[FIRST-PARTY]` | BTech Holdings Limited / Binance Affiliate `[FIRST-PARTY]` |
| **Official Documentation** | [BNB Chain Docs](https://docs.bnbchain.org/) `[FIRST-PARTY]`<br>[Pyth Docs](https://docs.pyth.network/) `[FIRST-PARTY]` | [Ondo Docs](https://docs.ondo.finance/) `[FIRST-PARTY]`<br>[Ondo Corporate Actions](https://docs.ondo.finance) `[FIRST-PARTY]` | [Backed Finance Docs](https://docs.backed.fi/) `[FIRST-PARTY]`<br>[xStocks Portal](https://xstocks.fi/) `[FIRST-PARTY]` | [Binance Tokenized Securities Docs](https://www.binance.com/) `[FIRST-PARTY]` |
| **Product Line Status** | Active Ecosystem Oracles & L1 `[FIRST-PARTY]` | Active OGM Tokenized Stocks `[FIRST-PARTY]` | Migrating from legacy "bTokens" (e.g. `bNVDA`) to "xStocks" (e.g. `NVDAx`) `[FIRST-PARTY]` | Active BEP-20 bStocks `[FIRST-PARTY]` |
| **Smart Contract Standard** | EVM Core / Oracles `[FIRST-PARTY]` | BEP-20 (18 decimals) `[ON-CHAIN]` | BEP-20 (18 decimals) `[ON-CHAIN]` | BEP-20 (18 decimals) `[ON-CHAIN]` |
| **Token Exposure Mechanics** | Oracle benchmark feeds `[ORACLE]` | Total Return (Auto DRIP / Reinvestment) `[FIRST-PARTY]` | Total Return via Multiplier / Redemption Rate (`.RR`) `[FIRST-PARTY]` | Total Return via Multiplier (`Raw × Multiplier = Effective`) `[FIRST-PARTY]` |
| **Authentication Requirements** | Public RPC and Pyth `price_feeds` are public `[FIRST-PARTY]` | DEX reads are permissionless `[ON-CHAIN]`; Primary mint/redeem requires KYC `[FIRST-PARTY]` | DEX reads are permissionless `[ON-CHAIN]`; Primary issuance requires KYC `[FIRST-PARTY]` | DEX reads are permissionless `[ON-CHAIN]`; Binance portal conversion requires KYC `[FIRST-PARTY]` |
| **Supported Networks** | BNB Smart Chain, opBNB `[FIRST-PARTY]` | BSC, Ethereum, Solana, HyperEVM `[FIRST-PARTY]` | BSC, Solana, Ethereum, Arbitrum, Base, Polygon `[FIRST-PARTY]` | BNB Smart Chain `[FIRST-PARTY]` |
| **Hackathon Redundancy** | Hackathon provides temporary aggregated API (swap routing, market data); does NOT provide an open canonical normalization layer `[FIRST-PARTY]` | N/A (Upstream Provider) | N/A (Upstream Provider) | N/A (Upstream Provider) |

---

## 2. Asset Discovery & Resolution Matrix (NVDA Focus)

| Discovery Field | BNB Ecosystem Oracle (Pyth) | Ondo Finance (NVDAon) | xStocks (NVDAx) | Legacy Backed (bNVDA) | bStocks (NVDAB) |
|---|---|---|---|---|---|
| **Underlying Ticker** | `NVDA` `[ORACLE]` | `NVDA` `[FIRST-PARTY]` | `NVDA` `[FIRST-PARTY]` | `NVDA` `[FIRST-PARTY]` | `NVDA` `[FIRST-PARTY]` |
| **Tokenized Symbol** | `Equity.US.NVDA/USD` `[ORACLE]` | `NVDAon` `[ON-CHAIN]` | `NVDAx` `[ON-CHAIN]` | `bNVDA` `[THIRD-PARTY]` | `NVDAB` `[ON-CHAIN]` |
| **On-Chain Token Name** | N/A | `"NVIDIA (Ondo Tokenized)"` `[ON-CHAIN]` | `"NVIDIA xStock"` `[ON-CHAIN]` | `"Backed NVIDIA"` `[THIRD-PARTY]` | `"NVIDIA Corp"` `[ON-CHAIN]` |
| **BSC Contract Address** | Oracle: `0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594` `[ON-CHAIN]` | `0xa9ee28c80f960b889dfbd1902055218cba016f75` `[ON-CHAIN]` | `0xc845b2894dbddd03858fd2d643b4ef725fe0849d` `[ON-CHAIN]` | `0xa34c5e0abe843e10461e2c9586ea03e55dbcc495` `[THIRD-PARTY]` | `0x02fca66c1d1afb4e2a7884261eb00f63598a7436` `[ON-CHAIN]` |
| **Decimals** | N/A | `18` `[ON-CHAIN]` | `18` `[ON-CHAIN]` | `18` `[THIRD-PARTY]` | `18` `[ON-CHAIN]` |
| **Market Status (Open/Closed)** | Real-time `is_open: false/true` and schedule `[ORACLE]` | TradFi market hours (trades 24/7 on DEX) `[FIRST-PARTY]` | TradFi market hours (trades 24/7 on DEX) `[FIRST-PARTY]` | TradFi market hours `[FIRST-PARTY]` | TradFi market hours (trades 24/7 on DEX) `[FIRST-PARTY]` |
| **Share Exposure Multiplier** | 1.0 (Price feed) `[ORACLE]` | Dynamic DRIP / Total Return `[FIRST-PARTY]` | Dynamic Redemption Rate (`Crypto.NVDAX/NVDA.RR`) `[ORACLE]` | 1:1 nominal tracker (legacy) `[FIRST-PARTY]` | Dynamic Multiplier (`Raw × Multiplier = Effective`) `[FIRST-PARTY]` |
| **BSC Secondary Liquidity** | N/A | Active on PancakeSwap `[THIRD-PARTY]` | Low on BSC; Primary on Solana `[THIRD-PARTY]` | Legacy / Phasing out `[FIRST-PARTY]` | High on PancakeSwap ($3.5M+ pool) `[THIRD-PARTY]` |
| **Attestation / Proof of Reserve** | Cryptographic publisher quorum `[ORACLE]` | Custodian attestations `[FIRST-PARTY]` | Daily attestation reports via `assets.backed.fi` `[FIRST-PARTY]` | Daily attestation reports `[FIRST-PARTY]` | Custodial backing via Binance `[FIRST-PARTY]` |

---

## 3. Cross-Asset Generalization Audit (AAPL & TSLA)

| Asset | Provider | Claimed Symbol | Claimed BSC Contract | Evidence Class | Audit Verification Result |
|---|---|---|---|---|---|
| **AAPL** | Ondo | `AAPLon` | `0x390a684EF9cADE28A7AD0DFa61AB1Eb3842618c4` | **`[ON-CHAIN]`** | **CONFIRMED**: `symbol()`="AAPLon", `name()`="Apple (Ondo Tokenized)", `decimals`=18. |
| **AAPL** | Pyth | `Equity.US.AAPL/USD` | Feed ID: `49f6b65cb1...` | **`[ORACLE]`** | **CONFIRMED**: Valid live feed on BSC Pyth contract. |
| **AAPL** | bStocks | `AAPLB` | `0x1535492d5395A377aCd5386a51272C151A67a4e6` | **`[UNKNOWN]`** | **CORRECTED / UNVERIFIED**: Returned empty bytecode on BSC RPC. |
| **AAPL** | xStocks | `AAPLX` | `0x892a06bbd6c5dca9718db0d321523c932f91bbef` | **`[THIRD-PARTY]`** | **PARTIAL**: Pyth feed exists; BSC pool unverified on-chain. |
| **TSLA** | Ondo | `TSLAon` | `0x2494b603319d4D9F9715c9f4496d9E0364B59d93` | **`[ON-CHAIN]`** | **CONFIRMED**: `symbol()`="TSLAon", `name()`="Tesla (Ondo Tokenized)", `decimals`=18. |
| **TSLA** | Pyth | `Equity.US.TSLA/USD` | Feed ID: `16dad506d7...` | **`[ORACLE]`** | **CONFIRMED**: Valid live feed on BSC Pyth contract. |
| **TSLA** | bStocks | `TSLAB` | `0x256CebE4cfA2576bA1aC26D68d7Fe2E7284fB144` | **`[UNKNOWN]`** | **CORRECTED / UNVERIFIED**: Returned empty bytecode on BSC RPC. |
| **TSLA** | xStocks | `TSLAX` | `0x7a305f6bf0b9795029e0ddcf952a13b680749ebc` | **`[THIRD-PARTY]`** | **PARTIAL**: Pyth feed exists; BSC pool unverified on-chain. |

---

## 4. Binance Web3 RWA Data API Infrastructure (Audited)

### 4.1 Endpoint Discovery
- **Primary Public Discovery Endpoint:**  
  `GET https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai?type={1|2|3}`
  - `type=1`: Ondo Finance Tokenized Stocks (`NVDAon`, `AAPLon`, `TSLAon`, etc.) across BSC (`chainId: "56"`) and Ethereum (`chainId: "1"`).
  - `type=2`: xStocks / Backed Finance Tokenized Stocks (`NVDAx`, `AAPLx`, `TSLAx`, etc.) on Solana (`chainId: "CT_501"`).
  - `type=3`: Binance bStocks (`NVDAB`, `TSLAB`, `MSFTB`, `METAB`, etc.) on BSC (`chainId: "56"`).
- **Authentication:** Public / No API Key required for discovery list endpoints.
- **Supplemental Authenticated APIs:**
  - `https://web3.binance.com/build/api/v1/` (Web3 Build & Swap execution, requires HMAC-SHA256 API Key).
  - `https://api.binance.com/sapi/v1/equity/` (Centralized equity trading & tokenization API).

### 4.2 Binance Schema vs RWA Lens Model Comparison
| Field | Binance Web3 RWA API | RWA Lens Core Model | Direct Mapping | Notes |
|---|---|---|---|---|
| **Ticker** | `ticker` (`"NVDA"`) | `underlying.ticker` | **YES** | Exact match |
| **Token Symbol** | `symbol` (`"NVDAB"`, `"NVDAon"`) | `representations[].tokenSymbol` | **YES** | Exact match |
| **Contract Address** | `contractAddress` | `representations[].contractAddress` | **YES** | Exact case-insensitive match |
| **Chain ID** | `chainId` (`"56"`, `"1"`, `"CT_501"`) | `representations[].chainId` | **YES** | Mapped directly |
| **Decimals** | `d` (`18`, `8`) | `representations[].decimals` | **YES** | Exact match |
| **Multiplier** | `multiplier` (`"1.000778223752807865"`) | `economicModel.currentMultiplier` | **YES** | Live dynamic value |
| **Update Timestamp**| `lastUpdateTime` (`1789012513889`) | `provenance.timestamp` | **YES** | Millisecond epoch |
| **Provider ID** | `type` (`1`, `2`, `3`) | `representations[].providerId` | **PARTIAL** | Mapped via type enum (1→ondo, 2→xstocks, 3→bstocks) |
| **Asset Class** | `assetType` (`1`=Equity, `3`=ETF) | `underlying.assetType` | **PARTIAL** | Enables equity vs ETF tagging |
| **Trading Pair** | `cs` (`"NVDABUSDT"`) | N/A | **BINANCE-SPECIFIC** | Centralized pair on Binance |
| **Accounting Model**| N/A (implied by type) | `economicModel.mechanism` | **RWA LENS EXCLUSIVE** | RWA Lens provides exact economic formulas |
| **Legal Issuer** | N/A | `representations[].issuer` | **RWA LENS EXCLUSIVE** | Institutional legal entity attribution |
| **Oracle Feed** | N/A | `economicModel.rateFeedSymbol` | **RWA LENS EXCLUSIVE** | Pyth Oracle Hermes integration |

