# RWA Lens

> Discovery and normalization infrastructure for tokenized equities on BNB Smart Chain.

The consumer-facing interface built on top of RWA Lens is called **StockDNA**.

Developed for **BNB Hack: Tokenized Stocks Edition**.

---

## The Problem RWA Lens Solves

Multiple institutional issuers (such as Ondo Finance, bStocks, and xStocks/Backed Finance) issue tokenized equities on BNB Smart Chain. However, the ecosystem suffers from substantial technical fragmentation:

1. **Non-Standard Tickers & Naming**: For the same stock (e.g. NVIDIA), issuers use diverging symbols (`NVDAon`, `NVDAB`, `NVDAx`), causing symbol collisions with legacy tokens (e.g. `bNVDA` vs `NVDAB`).
2. **Distinct Economic Accounting**: Issuers do not use identical share-accounting models. Ondo uses Scaled UI / Auto-DRIP; bStocks uses an on-chain Multiplier formula (`Raw × Multiplier = Effective Balance`); xStocks uses continuous Redemption Rate tracker certificates.
3. **Indexer Unreliability**: Third-party indexers frequently mix unverified community honeypots with genuine institutional contracts.

**RWA Lens** acts as the canonical verification, discovery, and normalization layer across these protocols without concealing their underlying economic differences.

---

## Core Architecture & Provider Adapters

RWA Lens isolates provider-specific logic into dedicated adapters that normalize raw on-chain and issuer data into a shared, type-safe domain model:

- **Ondo Adapter** (`src/providers/ondo`): Normalizes Ondo Global Markets BEP-20 tokens, Auto-DRIP dividend reinvestment, and Scaled UI models.
- **bStocks Adapter** (`src/providers/bstocks`): Normalizes Binance bStocks BEP-20 tokens, on-chain multiplier scaling, and dividend withholding tax adjustments.
- **xStocks Adapter** (`src/providers/xstocks`): Normalizes Backed Finance / xStocks tracker certificates and `.RR` continuous redemption rates.
- **BNB / Pyth Oracle Adapter** (`src/providers/bnb`): Normalizes traditional market hours, NASDAQ schedules, and 24/7 price feeds.

---

## Normalization & Provenance Philosophy

1. **No Fake Equivalence**: We do not force distinct financial mechanisms into a misleading "1 token = 1 share" assumption. Instead, the domain model provides common normalized identifiers alongside structured, provider-specific economic models (`EconomicModel`).
2. **Strict Provenance**: Every verified equity and representation carries an `EvidenceRecord` declaring its evidence class (`FIRST_PARTY`, `ON_CHAIN`, `ORACLE`, `THIRD_PARTY`, `INFERRED`, `UNKNOWN`) and confidence level.
3. **No Unverified Hallucinations**: Only representations verified on-chain via direct bytecode inspection (`eth_call`) and first-party docs are admitted into the verified registry.

---

## Quick Developer Usage

```typescript
import { lookupByTicker, lookupByContract } from "@/lens";

// 1. Ticker Lookup
const result = lookupByTicker("NVDA");
if (result.success) {
  console.log(`Underlying: ${result.underlying.name} (${result.underlying.ticker})`);
  console.log(`Discovered ${result.representations.length} verified representations:`);
  for (const rep of result.representations) {
    console.log(`- [${rep.providerName}] ${rep.tokenSymbol} (${rep.contractAddress})`);
    console.log(`  Economic Mechanism: ${rep.economicModel.mechanism}`);
  }
}

// 2. Reverse Contract Lookup
const ondoContract = "0xa9ee28c80f960b889dfbd1902055218cba016f75";
const contractResult = lookupByContract(ondoContract);
if (contractResult.success) {
  console.log(`Contract ${ondoContract} maps to:`);
  console.log(`- Token: ${contractResult.matchedRepresentation.tokenSymbol}`);
  console.log(`- Underlying: ${contractResult.underlying.ticker}`);
  console.log(`- Evidence: ${contractResult.matchedRepresentation.provenance.sourceClass}`);
}
```

---

## Current Supported Scope

| Ticker | Company Name | Verified Representations on BNB Smart Chain |
|---|---|---|
| **`NVDA`** | NVIDIA Corporation | **Ondo** (`NVDAon`), **bStocks** (`NVDAB`), **xStocks** (`NVDAx`) |
| **`AAPL`** | Apple Inc. | **Ondo** (`AAPLon`) *(bStocks/xStocks pending first-party on-chain verification)* |
| **`TSLA`** | Tesla, Inc. | **Ondo** (`TSLAon`) *(bStocks/xStocks pending first-party on-chain verification)* |

---

## Known Limitations

- **Curated Coverage**: Only representations verified via direct on-chain inspection and first-party issuer documentation are currently in the registry.
- **Off-Chain Corporate Actions**: Dividend announcements and split schedules are tracked via issuer multipliers; direct historical corporate action logs require indexer integrations in future phases.
