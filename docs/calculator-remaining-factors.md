# Complete Calculator Factor Investigation: NVDAon & NVDAx

**Date:** September 30, 2026  
**Status:** Complete Investigation Report (Phase 8B)  
**Target Chain:** BNB Smart Chain (Chain ID: 56)  
**Underlying Benchmark:** NVIDIA Corporation (NVDA · NASDAQ)  

---

## Executive Summary

This investigation determined the runtime feasibility of obtaining reliable, authoritative accounting factors for the remaining two tokenized NVIDIA representations on BNB Smart Chain:

1. **NVDAx (Backed / xStocks)**: **GO** (Direct On-Chain BSC Read).  
   Disassembled the runtime EVM bytecode of the proxy implementation contract (`0x65c40d624af3b18c109fbf87b7deff34cdc5f19b`). Proved that the deployed token contract on BNB Smart Chain (`0xc845b2894dbddd03858fd2d643b4ef725fe0849d`) natively implements `multiplier()` (`0x1b3ed722`) and `lastMultiplier()` (`0xd1786aab`), returning uint256 with 18 decimals (`1.001701196801074`).
2. **NVDAon (Ondo Global Markets)**: **NO-GO** (On-Chain State Unavailable).  
   Disassembled the runtime EVM bytecode of the implementation contract (`0x578f397ca4661d1db4d9a65065d6b284a1a850fd`) behind the UpgradeableBeacon (`0xc046b05a920e4b412815934dd8e58904dda73315`). Proved that the token is a standard `ERC20Upgradeable` contract without multiplier, rebase, scale factor, or oracle view methods.

---

## Candidate Source Matrix & Verdicts

| Representation | Token Mechanism | Candidate Source | Live Reachable? | Authoritative? | Current Factor | Freshness / Decimals | Implementation Feasibility | Verdict |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **NVDAB** (`0x02fc...`) | Multiplier Model | Direct BSC RPC `multiplier()` (`0xdc767007`) | **Yes** (100%) | **Yes** (Contract state) | `1.000778223752807865` | Live block · 18 dec | High (Already implemented) | **GO** |
| **NVDAx** (`0xc845...`) | Auto-Fee / Multiplier | Direct BSC RPC `multiplier()` (`0x1b3ed722`) | **Yes** (100%) | **Yes** (Contract state) | `1.001701196801074000` | Live block · 18 dec | High (Direct `eth_call`) | **GO** |
| **NVDAx** (`0xc845...`) | Redemption Rate | Pyth Hermes `Crypto.NVDAX/NVDA.RR` | **Restricted** (401 Unauthorized) | **Yes** (Pyth Oracle) | `1.00170119` (Cached) | 200ms · -8 exp | Medium (Requires auth / Hermes proxy) | **GO WITH CAVEAT** |
| **NVDAon** (`0xa9ee...`) | Auto-DRIP (Scaled UI) | Direct BSC Contract State | **No** (Method does not exist) | N/A | N/A | N/A | Impossible (0 on-chain view methods) | **NO-GO** |
| **NVDAon** (`0xa9ee...`) | Auto-DRIP (Scaled UI) | Binance Web3 RWA API | **No** (Network timeout in runtime) | **Secondary** (Binance aggregator) | `1.00171525` (Observed) | Sporadic | Low (Unreliable RPC timeout) | **NO-GO** |
| **NVDAon** (`0xa9ee...`) | Auto-DRIP (Scaled UI) | Ondo Official Public REST API | **No** (No unauthenticated feed) | **Yes** (Issuer) | N/A | N/A | Unavailable | **NO-GO** |

---

## 1. Deep Dive: NVDAx (Backed / xStocks)

### On-Chain Contract Architecture
- **Proxy Contract Address (BSC)**: `0xc845b2894dbddd03858fd2d643b4ef725fe0849d`
- **Proxy Pattern**: ERC-1967 Transparent Upgradeable Proxy
  - Slot `0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc`: `0x00000000000000000000000065c40d624af3b18c109fbf87b7deff34cdc5f19b`
- **Implementation Contract Address**: `0x65c40d624af3b18c109fbf87b7deff34cdc5f19b`
- **Implementation Name**: `BackedAutoFeeTokenImplementation`
- **Contract Version**: `1.1.0` (returned by selector `0xffa1ad74`)
- **Legal Terms**: `https://www.backedassets.fi/legal-documentation` (returned by selector `0xd5025625`)

### Verified Function Selectors on BSC Contract
Through complete EVM dispatcher extraction and execution against BSC mainnet:

| Function Signature | 4-Byte Selector | Raw Hex Output | Decoded Value |
| :--- | :--- | :--- | :--- |
| `multiplier()` | `0x1b3ed722` | `0x00...0de6c1ee66696350` | **`1.001701196801074`** ($\times 10^{18}$) |
| `lastMultiplier()` | `0xd1786aab` | `0x00...0de6c1ee66696350` | **`1.001701196801074`** ($\times 10^{18}$) |
| `getCurrentMultiplier()` | `0x2b63c300` | `0x00...0de6c1ee66696350...05` | Tuple: `(multiplier: 1.001701196801074, fee: 0, nonce: 5)` |
| `newMultiplier()` | `0x60638067` | `0x00...0de6c1ee66696350` | **`1.001701196801074`** |
| `lastMultiplierNonce()` | `0x8230ef7c` | `0x00...05` | Nonce `5` |
| `feePerPeriod()` | `0xf00c1dff` | `0x00...00` | `0` (0% fee accrued) |

### Exact RPC Call Specification for NVDAx
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "eth_call",
  "params": [
    {
      "to": "0xc845b2894dbddd03858fd2d643b4ef725fe0849d",
      "data": "0x1b3ed722"
    },
    "latest"
  ]
}
```
- **Raw Hex**: `0x0000000000000000000000000000000000000000000000000de6c1ee66696350`
- **Decimal BigInt**: `1001701196801074000`
- **Calculated Factor**: `1001701196801074000 / 10^18 = 1.001701196801074`

### Pyth Redemption Rate Feed Evaluation
- **Feed ID**: `b675c4e9f46d94afa9174a7df09966b77a2950970bb50a77ec8ad4fcfd8266f4`
- **Symbol**: `Crypto.NVDAX/NVDA.RR`
- **Semantic Meaning**: "NVIDIA XSTOCK / NVIDIA REDEMPTION RATE". Pyth publishes the redemption rate as an oracle benchmark across chains.
- **Evaluation**: The on-chain contract state on BSC provides a direct, authenticated, and zero-cost source that is identical to the underlying prospectus mechanism without requiring Hermes API keys.

---

## 2. Deep Dive: NVDAon (Ondo Global Markets)

### On-Chain Contract Architecture
- **Proxy Contract Address (BSC)**: `0xa9ee28c80f960b889dfbd1902055218cba016f75`
- **Proxy Pattern**: ERC-1967 UpgradeableBeacon Proxy
  - Beacon Slot `0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50`: `0xc046b05a920e4b412815934dd8e58904dda73315`
- **Beacon Implementation**: Calling `implementation()` (`0x5c60da1b`) on `0xc046b05a920e4b412815934dd8e58904dda73315` resolves to:
  `0x578f397ca4661d1db4d9a65065d6b284a1a850fd`
- **Implementation Contract**: `OndoToken` (16,544 characters of EVM bytecode).

### Complete Selector Audit of `OndoToken` Implementation
Every single EVM entry point in `0x578f397ca4661d1db4d9a65065d6b284a1a850fd` was extracted and verified:
1. `0x01ffc9a7`: `supportsInterface(bytes4)`
2. `0x06fdde03`: `name()` -> `"NVIDIA (Ondo Tokenized)"`
3. `0x095ea7b3`: `approve(address,uint256)`
4. `0x18160ddd`: `totalSupply()`
5. `0x23b872dd`: `transferFrom(address,address,uint256)`
6. `0x248609c6`: `setTokenPauseManager(address)`
7. `0x248a9ca3`: `getRoleAdmin(bytes32)`
8. `0x282c51f3`: `BURNER_ROLE()`
9. `0x2f2ff15d`: `grantRole(bytes32,address)`
10. `0x313ce567`: `decimals()` -> `18`
11. `0x36568abe`: `renounceRole(bytes32,address)`
12. `0x39509351`: `increaseAllowance(address,uint256)`
13. `0x40c10f19`: `mint(address,uint256)`
14. `0x42966c68`: `burn(uint256)`
15. `0x461ad792`: `tokenPauseManager()` -> `0x6334924c787ebd21c881740ef6237ef51962638f`
16. `0x6290865d`: `compliance()` -> `0x76be569c94c39a2e2492de2f4d1c253f348250d0`
17. `0x70a08231`: `balanceOf(address)`
18. `0x79cc6790`: `burnFrom(address,uint256)`
19. `0x8f15b414`: `initialize(string,string,address,address)`
20. `0x9010d07c`: `getRoleMember(bytes32,uint256)`
21. `0x91d14854`: `hasRole(bytes32,address)`
22. `0x95d89b41`: `symbol()` -> `"NVDAon"`
23. `0x9dc29fac`: `burn(address,uint256)`
24. `0xa217fddf`: `DEFAULT_ADMIN_ROLE()`
25. `0xa457c2d7`: `decreaseAllowance(address,uint256)`
26. `0xa9059cbb`: `transfer(address,uint256)`
27. `0xabbb9f4c`: `CONFIGURER_ROLE()`
28. `0xb84c8246`: `setSymbol(string)`
29. `0xc47f0027`: `setName(string)`
30. `0xca15c873`: `getRoleMemberCount(bytes32)`
31. `0xd5391393`: `MINTER_ROLE()`
32. `0xd547741f`: `revokeRole(bytes32,address)`
33. `0xdd62ed3e`: `allowance(address,address)`
34. `0xf8981789`: `setCompliance(address)`

### Finding on NVDAon
The Ondo smart contract deployed on BNB Smart Chain is a **standard fixed-unit compliance token**. It does **not** store an on-chain dynamic scale factor or Auto-DRIP multiplier. The BEP-8056 Auto-DRIP mechanism is maintained off-chain by Ondo's platform / UI indexer.

---

## 3. Implementation Status (Phase 8C Complete)

1. **NVDAx (Backed / xStocks)**: **IMPLEMENTED & LIVE (AVAILABLE)**
   - Implemented direct BSC on-chain RPC adapter (`fetchXStocksMultiplierFromRpc` in `src/providers/xstocks/bsc-rpc.ts`) calling selector `0x1b3ed722` (`multiplier()`) and fallback `0xd1786aab` (`lastMultiplier()`) against `0xc845b2894dbddd03858fd2d643b4ef725fe0849d`.
   - Decodes 18-decimal uint256 multiplier dynamically at runtime (observed `1.001701196801074`).
   - Integrated into `RWALensEngine` async lookups and comparison matrix builder (`buildEquityComparisonAsync`).
   - Comparison matrix and calculator dynamically normalize NVDAx:
     - 100 NVDAx $\to$ `100.170120` share-equivalents $\times$ \$224.15 = \$22,453.13 USD reference value (+$38.13 USD mechanism value accretion).
   - Source attributed as: `BNB Smart Chain (eth_call multiplier())`.

2. **NVDAon (Ondo Global Markets)**: **TRUTHFULLY UNAVAILABLE (DATA GAP PRESERVED)**
   - Maintained `UNAVAILABLE` normalization status on BSC because the deployed contract contains 0 view methods for scale factors and external API feeds are unreachable.
   - Preserves TickerKin's core principle: **Never assume 1 token = 1 share.**
