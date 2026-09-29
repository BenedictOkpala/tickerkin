# RWA Lens

> Discovery, normalization, and intelligence infrastructure for tokenized equities on BNB Smart Chain.

Developed for **BNB Hack: Tokenized Stocks Edition**.

---

## The Three Product Surfaces

```
                              ┌───────────────────────────────────┐
                              │       RWA Lens Core Engine        │
                              │ (Deterministic Normalization & DB)│
                              └─────────────────┬─────────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
        ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
        │    TickerKin     │           │   RWA Lens API   │           │   RWA Lens MCP   │
        │  Human Explorer  │           │  Developer REST  │           │ Agent Intelligence│
        │    (Web UI)      │           │  (HTTP Endpoints)│           │ (Model Context)  │
        └──────────────────┘           └──────────────────┘           └──────────────────┘
```

1. **TickerKin (Human-Facing Web Explorer)**: Interactive visual financial explorer to trace equities across institutional BEP-20 representations (`Kin Map`), compare mechanics side-by-side (`Compare Matrix`), and inspect claim-scoped verification (`Evidence Audit Log`).
2. **RWA Lens REST API (Developer Interface)**: Public JSON REST endpoints (`/api/lens`, `/api/lens/ticker/:ticker`, `/api/lens/contract/:address`) providing programmatic normalization for financial applications.
3. **RWA Lens MCP (Agent-Facing Interface)**: Model Context Protocol server exposing deterministic tools (`resolve_equity`, `resolve_contract`, `compare_representations`, `get_evidence`, `list_equities`) for AI agents and LLMs.

---

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

---

## RWA Lens Model Context Protocol (MCP) Interface

RWA Lens exposes an agent-facing **MCP (Model Context Protocol)** server allowing autonomous AI agents to query verified tokenized-equity intelligence over standard stdio transport.

### 1. Starting the MCP Server

```bash
# Start via npm script
npm run mcp

# Or execute via npx tsx
npx tsx src/mcp/cli.ts
```

### 2. MCP Client Configuration Example

Add RWA Lens to your MCP client configuration (e.g. Claude Desktop, Cursor, or AI Agent config):

```json
{
  "mcpServers": {
    "rwa-lens": {
      "command": "npx",
      "args": ["tsx", "C:/Users/USER/.gemini/antigravity/scratch/rwa-lens/src/mcp/cli.ts"]
    }
  }
}
```

### 3. Available MCP Tools

| Tool | Agent Intent & Purpose | Inputs |
| :--- | :--- | :--- |
| **`resolve_equity`** | Discover all verified BEP-20 representations, issuing providers, and economic mechanics for a traditional equity ticker. | `ticker` (string, e.g. `"NVDA"`) |
| **`resolve_contract`** | Reverse-lookup a BSC contract address to determine which traditional stock and provider it represents. | `contractAddress` (hex string, e.g. `"0xa9ee..."`) |
| **`compare_representations`** | Perform a structured technical comparison of mechanics (Auto-DRIP vs Multiplier vs Redemption-Rate) across issuers. | `ticker` (string, e.g. `"NVDA"`) |
| **`get_evidence`** | Retrieve claim-scoped verification evidence and provenance audit trails for an equity and optional provider. | `ticker` (string), optional `providerId` |
| **`list_equities`** | List the curated set of traditional equities indexed by RWA Lens on BNB Smart Chain. | none |

### 4. Safety & Non-Execution Boundary

RWA Lens MCP is strictly a **read-only intelligence interface**. It does not sign transactions, control wallets, place trades, generate swap calldata, or provide investment advice.

