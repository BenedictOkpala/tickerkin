# RWA Lens

> Discovery and normalization infrastructure for tokenized equities on BNB Smart Chain.

The consumer-facing interface built on top of RWA Lens is called **StockDNA**.

Developed for **BNB Hack: Tokenized Stocks Edition**.

---

## StockDNA: Visual Equity Decomposition

**StockDNA** is the flagship web application built directly on top of the RWA Lens public API. It transforms fragmented tokenized equity representations on BNB Smart Chain into an intuitive visual decomposition:

- **DNA Spatial Canvas**: Visualizes the 1-to-N relationship from the traditional US equity root (e.g. `NVDA`) branching to multiple tokenized implementations (`Ondo`, `bStocks`, `xStocks`).
- **Economic Mechanism Explainer**: Side-by-side comparative pills explaining the real accounting and yield mechanics (Ondo Auto-DRIP vs bStocks Balance Multiplier vs xStocks Redemption Rate Tracker) without hiding critical differences.
- **Evidence & Audit Drawer**: Full cryptographic and provenance audit trail detailing on-chain deployment status, Pyth Oracle price feeds, official token registries, and confidence levels for every asset.
- **Contract Reverse Lookup**: Paste any verified BNB Smart Chain BEP-20 address (or ticker) to immediately resolve token identity, provider attribution, and underlying asset metadata.
- **Raw RWA Lens JSON Drawer**: Real-time developer inspector to inspect the raw normalized payload matching the RWA Lens REST API schema.

---

## The Problem RWA Lens Solves

Multiple institutional issuers (such as Ondo Finance, bStocks, and xStocks/Backed Finance) issue tokenized equities on BNB Smart Chain. However, the ecosystem suffers from substantial technical fragmentation:

1. **Non-Standard Tickers & Naming**: For the same stock (e.g. NVIDIA), issuers use diverging symbols (`NVDAon`, `NVDAB`, `NVDAx`), causing symbol collisions with legacy tokens (e.g. `bNVDA` vs `NVDAB`).
2. **Distinct Economic Accounting**: Issuers do not use identical share-accounting models. Ondo uses Scaled UI / Auto-DRIP; bStocks uses an on-chain Multiplier formula (`Raw × Multiplier = Effective Balance`); xStocks uses continuous Redemption Rate tracker certificates.
3. **Indexer Unreliability**: Third-party indexers frequently mix unverified community honeypots with genuine institutional contracts.

**RWA Lens** acts as the canonical verification, discovery, and normalization layer across these protocols without concealing their underlying economic differences.

---

## Public HTTP API

RWA Lens exposes a clean, lightweight REST API wrapping the core normalization engine:

### 1. Root Discovery & Metadata
**Endpoint:** `GET /api/lens`  
**Description:** Returns service capabilities, supported chain, supported providers, and currently verified tickers.

**Response Example:**
```json
{
  "ok": true,
  "data": {
    "service": "RWA Lens",
    "version": "0.1.0",
    "chain": "BNB Smart Chain",
    "chainId": 56,
    "supportedProviders": [
      {
        "id": "ondo",
        "name": "Ondo Finance (Ondo Global Markets)",
        "issuer": "Ondo Global Markets / Ondo Finance",
        "economicMechanism": "auto_drip_scaled"
      },
      {
        "id": "bstocks",
        "name": "Binance bStocks",
        "issuer": "BTech Holdings Limited (Binance Affiliate)",
        "economicMechanism": "multiplier"
      },
      {
        "id": "xstocks",
        "name": "xStocks (Backed Finance)",
        "issuer": "Backed Assets (JE) Limited (acquired by Kraken)",
        "economicMechanism": "redemption_rate"
      }
    ],
    "supportedTickers": ["NVDA", "AAPL", "TSLA"],
    "totalVerifiedContracts": 5,
    "endpoints": {
      "discovery": "/api/lens",
      "tickerLookup": "/api/lens/ticker/:ticker",
      "contractLookup": "/api/lens/contract/:address"
    }
  }
}
```

---

### 2. Ticker Lookup
**Endpoint:** `GET /api/lens/ticker/:ticker` (case-insensitive)  
**Description:** Returns underlying traditional equity data alongside all verified tokenized representations on BNB Smart Chain.

**Request:** `GET /api/lens/ticker/NVDA`  
**Response Example:**
```json
{
  "ok": true,
  "data": {
    "query": "NVDA",
    "underlying": {
      "ticker": "NVDA",
      "name": "NVIDIA Corporation",
      "exchange": "NASDAQ",
      "quoteCurrency": "USD",
      "marketHours": {
        "isOpen": false,
        "schedule": "America/New_York;0930-1600,...",
        "timezone": "America/New_York"
      },
      "provenance": {
        "sourceClass": "ORACLE",
        "sourceName": "Pyth Network Hermes API & BSC Pyth Contract",
        "confidence": "HIGH"
      }
    },
    "representations": [
      {
        "providerId": "ondo",
        "providerName": "Ondo Finance (Ondo Global Markets)",
        "issuer": "Ondo Global Markets / Ondo Finance",
        "tokenSymbol": "NVDAon",
        "tokenName": "NVIDIA (Ondo Tokenized)",
        "chain": "BNB Smart Chain",
        "chainId": 56,
        "contractAddress": "0xa9ee28c80f960b889dfbd1902055218cba016f75",
        "decimals": 18,
        "tokenStandard": "BEP-20",
        "status": "ACTIVE",
        "economicModel": {
          "mechanism": "auto_drip_scaled",
          "description": "Total-return tracker with automated dividend reinvestment (DRIP)",
          "scaledUiEnabled": true,
          "dividendHandling": "automatic_dividend_reinvestment_drip",
          "tokenPriceTracksNav": true
        },
        "provenance": {
          "sourceClass": "ON_CHAIN",
          "sourceName": "BNB Smart Chain RPC (eth_call) & Ondo Official Portal",
          "confidence": "HIGH"
        }
      },
      {
        "providerId": "bstocks",
        "tokenSymbol": "NVDAB",
        "contractAddress": "0x02fca66c1d1afb4e2a7884261eb00f63598a7436",
        "economicModel": {
          "mechanism": "multiplier",
          "formula": "effective_balance = raw_token_balance * multiplier"
        }
      },
      {
        "providerId": "xstocks",
        "tokenSymbol": "NVDAx",
        "contractAddress": "0xc845b2894dbddd03858fd2d643b4ef725fe0849d",
        "economicModel": {
          "mechanism": "redemption_rate",
          "rateFeedSymbol": "Crypto.NVDAX/NVDA.RR"
        }
      }
    ]
  }
}
```

---

### 3. Contract Reverse Lookup
**Endpoint:** `GET /api/lens/contract/:address` (case-insensitive)  
**Description:** Resolves a BNB Smart Chain token contract address back to its underlying equity and normalized provider representation.

**Request:** `GET /api/lens/contract/0xa9ee28c80f960b889dfbd1902055218cba016f75`  
**Response Example:**
```json
{
  "ok": true,
  "data": {
    "query": "0xa9ee28c80f960b889dfbd1902055218cba016f75",
    "normalizedAddress": "0xa9ee28c80f960b889dfbd1902055218cba016f75",
    "underlying": {
      "ticker": "NVDA",
      "name": "NVIDIA Corporation"
    },
    "matchedRepresentation": {
      "providerId": "ondo",
      "tokenSymbol": "NVDAon",
      "contractAddress": "0xa9ee28c80f960b889dfbd1902055218cba016f75"
    }
  }
}
```

---

## Response Envelope & Error Format

All responses strictly adhere to the standard envelope format:

- **Success (200 OK):**
  ```json
  {
    "ok": true,
    "data": { ... }
  }
  ```
- **Error (400 Bad Request / 404 Not Found):**
  ```json
  {
    "ok": false,
    "error": {
      "code": "INVALID_ADDRESS" | "TICKER_NOT_FOUND" | "CONTRACT_NOT_FOUND",
      "message": "Human readable description"
    }
  }
  ```

---

## Current Supported Scope & Limitations

| Ticker | Company Name | Verified Representations on BNB Smart Chain |
|---|---|---|
| **`NVDA`** | NVIDIA Corporation | **Ondo** (`NVDAon`), **bStocks** (`NVDAB`), **xStocks** (`NVDAx`) |
| **`AAPL`** | Apple Inc. | **Ondo** (`AAPLon`) *(bStocks/xStocks pending first-party on-chain verification)* |
| **`TSLA`** | Tesla, Inc. | **Ondo** (`TSLAon`) *(bStocks/xStocks pending first-party on-chain verification)* |

- **Strict Data Integrity**: Unpolled dynamic multipliers and rates are returned as `undefined` (omitted from JSON) rather than fabricated as `1.0`.
- **Curated Coverage**: Candidate contracts failing on-chain bytecode validation are strictly excluded from the registry.
