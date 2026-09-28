import { lookupByTicker, lookupByContract } from "@/lens";

/**
 * Developer usage walkthrough for RWA Lens.
 *
 * Demonstrates:
 * 1. Looking up all verified tokenized representations for a ticker ("NVDA").
 * 2. Looking up underlying equity & representation by BSC contract address.
 */
export function runDeveloperExample() {
  // 1. Ticker Lookup
  const nvdaResult = lookupByTicker("NVDA");
  if (nvdaResult.success) {
    console.log(`Discovered ${nvdaResult.representations.length} verified representations for ${nvdaResult.underlying.name}:`);
    for (const rep of nvdaResult.representations) {
      console.log(`- [${rep.providerName}] ${rep.tokenSymbol} (${rep.contractAddress}) | Model: ${rep.economicModel.mechanism}`);
    }
  }

  // 2. Reverse Contract Address Lookup
  const ondoContract = "0xa9ee28c80f960b889dfbd1902055218cba016f75";
  const contractResult = lookupByContract(ondoContract);
  if (contractResult.success) {
    console.log(`Address ${ondoContract} resolved to:`);
    console.log(`- Underlying: ${contractResult.underlying.ticker} (${contractResult.underlying.name})`);
    console.log(`- Token: ${contractResult.matchedRepresentation.tokenSymbol} (${contractResult.matchedRepresentation.tokenName})`);
    console.log(`- Provenance Class: ${contractResult.matchedRepresentation.provenance.sourceClass}`);
  }
}
