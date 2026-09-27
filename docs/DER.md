# Developer Experience Report (DER) — Phase 1 Discovery: NVDA

## Entry Date: 2026-09-27
**Subject:** Discovery, contract resolution, and cross-provider evaluation for Tokenized Equities on BNB Smart Chain (Focus: `NVDA`, cross-check: `AAPL`, `TSLA`).

---

### 1. What We Attempted
- Researched first-party documentation, APIs, and smart contract deployments for tokenized stocks on BNB Smart Chain across four target categories:
  1. BNB Chain ecosystem infrastructure & oracles (Pyth, BscScan, BSC RPCs)
  2. Ondo Finance (`NVDAon`)
  3. xStocks / Backed Finance (`NVDAx` / `bNVDA`)
  4. bStocks (`NVDAB`)
- Resolved contract addresses in both directions: `Ticker (NVDA) -> Token Contract` and `Token Contract -> Underlying Equity`.
- Tested real read-only public queries against BNB Smart Chain nodes, Pyth Hermes API, and DEX indexers to capture sanitized fixtures in `data/raw/`.
- Checked cross-asset generalization against Apple (`AAPL`) and Tesla (`TSLA`).

---

### 2. What We Expected Before Discovery
- We anticipated that BNB Chain might offer a unified canonical registry contract or single REST API aggregating all supported tokenized stock issuers (bStocks, Ondo, xStocks).
- We expected token symbols to follow a uniform convention across providers (e.g. `bNVDA` for all BNB tokens or standard suffix).
- We expected market open/closed status to be natively readable on-chain from token contracts.

---

### 3. Documentation & Technical Sources Used
- **BNB Chain Official Portal & Blog:** [BNB Hack Tokenized Stocks Edition Announcement](https://www.bnbchain.org/en/blog/bnb-hack-tokenized-stocks-edition) & [docs.bnbchain.org](https://docs.bnbchain.org/)
- **Ondo Finance:** [Ondo Documentation](https://docs.ondo.finance/) & [Ondo Global Markets](https://ondo.finance/)
- **Backed Finance / xStocks:** [Backed Assets Documentation](https://docs.backed.fi/) & [xStocks Portal](https://xstocks.fi/)
- **Pyth Network:** [Pyth Hermes API Reference](https://docs.pyth.network/price-feeds/api-reference/hermes-api) & Pyth Contract on BSC (`0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594`)
- **Block Explorers & Indexers:** [BscScan](https://bscscan.com/) & GeckoTerminal BSC token endpoints.

---

### 4. What Worked
- **Contract Address Resolution**: Successfully resolved exact verified BSC contract addresses for all major issuers:
  - Ondo NVDA: `0xa9ee28c80f960b889dfbd1902055218cba016f75`
  - bStocks NVDA: `0x02fca66c1d1afb4e2a7884261eb00f63598a7436`
  - xStocks NVDA: `0xc845b2894dbddd03858fd2d643b4ef725fe0849d` (and Backed multi-chain `0xa34c5e0abe843e10461e2c9586ea03e55dbcc495`)
- **Pyth Oracle Feeds**: Pyth provides high-quality, free metadata identifying traditional market schedules, underlying NASDAQ tickers, and 24/7 tokenized feeds (`Equity.US.NVDA/USD`, `Crypto.NVDAON/USD`, `Crypto.NVDAX/USD`).
- **Standard BEP-20 Reads**: All token contracts implement standard 18-decimal BEP-20 interfaces queryable via public BSC RPC nodes (`https://bsc.publicnode.com`).

---

### 5. What Was Surprisingly Easy
- Querying Pyth Hermes `price_feeds` endpoint by ticker (`?query=NVDA&asset_type=equity`) returns comprehensive schedule and market open/close state without authentication or rate-limit friction.
- Cross-asset verification for `AAPL` and `TSLA` matched the exact same naming and structural patterns observed in `NVDA`.

---

### 6. What Was Unclear & Provider Naming Inconsistencies
- **Ticker Collision & Suffix Divergence**:
  - Ondo uses `<TICKER>on` (e.g., `NVDAon`, `AAPLon`, `TSLAon`).
  - bStocks uses `<TICKER>B` or `<TICKER>b` (e.g., `NVDAB`, `AAPLB`, `TSLAB`).
  - xStocks uses `<TICKER>X` (e.g., `NVDAX`, `AAPLX`, `TSLAX`), while legacy Backed certificates used `b<TICKER>` (e.g., `bNVDA`, `bAAPL`). Notice that `bNVDA` (Backed) and `NVDAB` (bStocks) look almost identical, creating severe confusion for end-users and developers.
- **Underlying Resolution via Token Name**: Standard BEP-20 `symbol()` returns the provider ticker (`NVDAon`), while `name()` varies between `"NVIDIA (Ondo Tokenized)"`, `"NVIDIA Corp"`, and `"NVIDIA xStock"`. Contract addresses alone do not declare their underlying traditional ISIN/CUSIP on-chain.

---

### 7. Authentication & Access Friction
- **Pyth Price Updates**: The `/v2/updates/price/latest` streaming endpoint returned an unauthorized response when called without a registered key/origin, whereas the feed metadata endpoint `/v2/price_feeds` was fully open.
- **Direct Minting / Redemption vs. Market Reads**: Accessing primary issuance APIs for Ondo and Backed requires KYC/institutional credentials. However, secondary market reads (prices, reserves, pools, DEX pairs) are completely permissionless on BSC.

---

### 8. Provider Differences Summary
- **Liquidity Distribution**: bStocks (`NVDAB`) and Ondo (`NVDAon`) maintain active liquidity pools on PancakeSwap on BSC (`>$3.5M` reserves for bStocks, `~$38M` FDV for Ondo). xStocks has broader liquidity on Solana while maintaining multi-chain deployment on BSC.
- **Corporate Action Mechanics**: Backed/xStocks adjusts the redemption rate (`.RR` feed in Pyth), whereas bStocks and Ondo distribute economic adjustments via balance/vault mechanics.

---

### 9. Suggestions for Improving the Developer Experience
1. **Unified Token Registry / Mapping Standard**: BSC ecosystem would strongly benefit from a canonical registry mapping `TradFi Ticker (NVDA) <-> Provider <-> BEP20 Contract Address`.
2. **Standardized Metadata Extensions**: Token contracts could implement an interface exposing `underlyingTicker()` and `issuerName()` directly on-chain to allow unambiguous reverse-resolution from contract address to stock.
