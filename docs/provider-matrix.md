# Provider Feature & Integration Matrix

This matrix tracks tokenized stock providers on **BNB Smart Chain (BSC)**, their technical integration capabilities, oracle standards, contract resolutions, and data availability.

---

## 1. Provider Technical Infrastructure & Sources

| Category | BNB Chain Ecosystem / Oracles | Ondo Finance | xStocks (Backed Finance) | bStocks |
|---|---|---|---|---|
| **Official Documentation** | [BNB Chain Docs](https://docs.bnbchain.org/)<br>[BNB Hack Tokenized Stocks](https://www.bnbchain.org/en/blog/bnb-hack-tokenized-stocks-edition) | [Ondo Docs](https://docs.ondo.finance/)<br>[Ondo Global Markets](https://ondo.finance/) | [Backed Finance Docs](https://docs.backed.fi/)<br>[xStocks Portal](https://xstocks.fi/) | [Binance bStocks Overview](https://www.binance.com/)<br>[BNB Chain RWA Hub](https://www.bnbchain.org/) |
| **API Documentation** | [Pyth Hermes API](https://docs.pyth.network/price-feeds/api-reference/hermes-api)<br>[BscScan API](https://docs.bscscan.com/) | [Ondo API / Portal](https://docs.ondo.finance/) (Restricted/Institutional for mint/redeem) | [Backed Public / Developer Docs](https://docs.backed.fi/) | Binance Broker / Web3 aggregated hackathon endpoint |
| **Relevant SDK** | [BNB Agent SDK](https://github.com/bnb-chain)<br>[@pythnetwork/pyth-evm-js](https://www.npmjs.com/package/@pythnetwork/pyth-evm-js) | Ethers / Viem standard BEP-20 integration | Ethers / Viem standard BEP-20 integration | Ethers / Viem standard BEP-20 integration |
| **Smart Contract Standard** | BEP-20 / EVM standard contracts | BEP-20 (Upgradable proxy, 18 decimals) | BEP-20 (ERC-20 tracker certificate, 18 decimals) | BEP-20 (18 decimals) |
| **Authentication Requirements** | Public RPC & Pyth `price_feeds` are public (no auth). Some enterprise RPCs / BscScan Pro require API keys. | Public DEX liquidity / on-chain reads are open. Direct issuance/redemption requires KYC & institutional credentials. | Public DEX reads / metadata are open. Direct issuance requires accredited KYC on Backed Assets. | Public DEX reads on BSC are open. Binance platform conversion requires authenticated KYC account. |
| **Supported Networks** | BNB Smart Chain (BSC Mainnet & Testnet), opBNB | BNB Smart Chain, Ethereum, Solana, HyperEVM | BNB Smart Chain, Solana, Ethereum, Arbitrum, Base, Polygon, Avalanche, TON, Tron | BNB Smart Chain (BSC Mainnet) |
| **BNB Smart Chain Support** | Native L1 host chain | Active (deployed & traded on BSC DEXes) | Active (multi-chain deployment on BSC) | Native to BNB Smart Chain |
| **Oracle Integration** | Pyth Network, Chainlink, Binance Oracle | Pyth / Chainlink / Ondo price feeds | Pyth Network redemption rate feeds (`.RR`), Chainlink | Pyth / DEX TWAP / Binance internal pricing |

---

## 2. Asset Discovery & Resolution Matrix (NVDA Focus)

| Discovery Field | BNB Ecosystem Oracle (Pyth / BSC) | Ondo Finance (NVDAon) | xStocks / Backed (NVDAx / bNVDA) | bStocks (NVDAB) |
|---|---|---|---|---|
| **Underlying Company** | NVIDIA Corp | NVIDIA Corporation | NVIDIA Corp | NVIDIA Corp |
| **Traditional Ticker** | `NVDA` | `NVDA` | `NVDA` | `NVDA` |
| **Tokenized Symbol** | `Equity.US.NVDA/USD` / `NVDA` | `NVDAon` | `NVDAX` (or `bNVDA`) | `NVDAB` |
| **Provider / Issuer** | Pyth Oracle Network on BSC | Ondo Global Markets / Ondo Finance | Backed Assets (JE) Limited (acquired by Kraken) | BTech Holdings Limited / Binance Affiliate |
| **BSC Contract Address** | Oracle: `0x4D7E825f80bDf85e913E0DD2A2D54927e9dE1594` | Token: `0xa9ee28c80f960b889dfbd1902055218cba016f75` | Token: `0xc845b2894dbddd03858fd2d643b4ef725fe0849d` (xStock)<br>`0xa34c5e0abe843e10461e2c9586ea03e55dbcc495` (Backed) | Token: `0x02fca66c1d1afb4e2a7884261eb00f63598a7436` |
| **Reference Price (TradFi)** | Live via NASDAQ schedule feed (`b10738...`) | Tracked to US market spot price | Tracked to US market spot price | Tracked to US market spot price |
| **On-Chain / Token Price** | 24/7 Pyth feed (`a470c4...`) | Live BSC DEX Price (~$224.50) | UNKNOWN (thin BSC pool liquidity) / Solana pool active | Live BSC DEX Price (~$223.92) |
| **Market Status (Open/Closed)** | Explicitly exposed via Pyth feed (`is_open: false/true`, schedules) | Implicit (underlying market hours 24/5; on-chain trades 24/7) | Exposed via Pyth schedule (`America/New_York`); trades 24/7 | Implicit (Binance conversion 24/7, on-chain trades 24/7) |
| **Token-to-Share Multiplier** | 1:1 | 1:1 (Fractional up to 18 decimals) | 1:1 (Redemption rate feed: `Crypto.NVDAX/NVDA.RR`) | 1:1 (Fractional up to 18 decimals) |
| **Backing / Collateral Info** | N/A (Oracle data feed) | 100% backed by underlying shares / notes held with qualified custodians | 1:1 collateralized with underlying shares in regulated custody | 1:1 backed by underlying shares held by regulated custodian |
| **Attestation / Proof of Reserve** | Cryptographic signature from Pyth publishers | Periodic custodian attestations | Public daily attestation reports via `assets.backed.fi` | UNKNOWN on-chain; custodial confirmation via Binance portal |
| **Liquidity & DEX Trading** | N/A (Oracle feed) | PancakeSwap BSC pools (`0xb90b...`) | Limited BSC liquidity; primary on Solana DEXes | High BSC liquidity on PancakeSwap (`$3.5M+` reserve) |
| **Corporate Actions (Splits/Divs)** | Reflected in underlying price index | Reinvestment / token balance multiplier | Handled via certificate redemption rate adjustment | Handled via contract balance or multiplier adjustment |
| **Data Timestamp / Freshness** | Millisecond-level oracle timestamp (`min_channel: 50ms`) | Block timestamp on BSC transfer / DEX swap | Block timestamp on BSC transfer | Block timestamp on BSC transfer |
| **Provider-Specific Fields** | `nasdaq_symbol`, `schedule`, `min_channel` | `coingecko_coin_id`, `image_url`, Ondo vault addresses | `redemption_rate`, multi-chain identical CREATE2 addresses | Binance conversion rate, 24h Binance volume index |

---

## 3. Cross-Asset Generalization Check (AAPL & TSLA)

| Asset Ticker | Pyth Feed ID (TradFi) | Pyth Feed ID (Ondo Feed) | Ondo BSC Contract Address | bStocks BSC Contract Address | xStocks BSC Contract Address | Generalization Consistency |
|---|---|---|---|---|---|---|
| **NVDA** | `b1073854ed24cbc...` | `207ddea2a443d30...` (`NVDAONUSD`) | `0xa9ee28c80f960b889dfbd1902055218cba016f75` | `0x02fca66c1d1afb4e2a7884261eb00f63598a7436` | `0xc845b2894dbddd03858fd2d643b4ef725fe0849d` | Baseline |
| **AAPL** | `49f6b65cb1de6b1...` | `e6734de88a83d9d...` (`AAPLONUSD`) | `0x390a684EF9cADE28A7AD0DFa61AB1Eb3842618c4` | `0x1535492d5395A377aCd5386a51272C151A67a4e6` | `0x892a06bbd6c5dca9718db0d321523c932f91bbef` | **Consistent** across all fields |
| **TSLA** | `16dad506d7db8da...` | `c09ef687ed07091...` (`TSLAONUSD`) | `0x2494b603319d4D9F9715c9f4496d9E0364B59d93` | `0x256CebE4cfA2576bA1aC26D68d7Fe2E7284fB144` | `0x7a305f6bf0b9795029e0ddcf952a13b680749ebc` | **Consistent** across all fields |
