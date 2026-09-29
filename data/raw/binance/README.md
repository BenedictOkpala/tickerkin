# Binance Web3 RWA Data API — Raw Response Archive

This directory stores verified, real-world API responses fetched from the official public Binance Web3 RWA endpoints.

---

## 1. Primary Public Endpoints Discovered

- **Base URL:** `https://www.binance.com`
- **RWA Token Detail List Endpoint:**  
  `GET /bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rwa/stock/detail/list/ai`
- **Query Parameters:**
  - `type=1`: Ondo Tokenized Stocks (`.on` / `on` suffix)
  - `type=2`: xStocks Tokenized Stocks (`.x` / `x` suffix)
  - `type=3`: Binance bStocks (`.B` / `B` suffix)
- **Authentication:** Public (no API key or HMAC signature required for this discovery list endpoint).
- **Date Fetched:** 2026-09-29T12:40:30.000Z

---

## 2. Stored Datasets

1. **[`rwa-stock-list-type1-ondo.json`](file:///C:/Users/USER/.gemini/antigravity/scratch/rwa-lens/data/raw/binance/rwa-stock-list-type1-ondo.json)**
   - Type: `type=1` (Ondo Finance)
   - Total Records: 309 tokens across BNB Smart Chain (`chainId: "56"`) and Ethereum (`chainId: "1"`).
2. **[`rwa-stock-list-type2-xstocks.json`](file:///C:/Users/USER/.gemini/antigravity/scratch/rwa-lens/data/raw/binance/rwa-stock-list-type2-xstocks.json)**
   - Type: `type=2` (xStocks / Backed Finance)
   - Total Records: 60 tokens on Solana (`chainId: "CT_501"`).
3. **[`rwa-stock-list-type3-bstocks.json`](file:///C:/Users/USER/.gemini/antigravity/scratch/rwa-lens/data/raw/binance/rwa-stock-list-type3-bstocks.json)**
   - Type: `type=3` (Binance bStocks)
   - Total Records: 17 tokens on BNB Smart Chain (`chainId: "56"`).
4. **[`nvda-findings.json`](file:///C:/Users/USER/.gemini/antigravity/scratch/rwa-lens/data/raw/binance/nvda-findings.json)**
   - Filtered representations for NVIDIA (`NVDA`) across all three provider categories.
