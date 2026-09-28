import type { UnderlyingEquity } from "./equity";
import type { TokenizedRepresentation } from "./token";

export interface TickerLookupSuccess {
  readonly success: true;
  readonly query: string;
  readonly underlying: UnderlyingEquity;
  readonly representations: readonly TokenizedRepresentation[];
}

export interface TickerLookupNotFound {
  readonly success: false;
  readonly query: string;
  readonly error: "TICKER_NOT_FOUND";
  readonly message: string;
}

export type TickerLookupResult = TickerLookupSuccess | TickerLookupNotFound;

export interface ContractLookupSuccess {
  readonly success: true;
  readonly query: string;
  readonly normalizedAddress: string;
  readonly matchedRepresentation: TokenizedRepresentation;
  readonly underlying: UnderlyingEquity;
}

export interface ContractLookupNotFound {
  readonly success: false;
  readonly query: string;
  readonly normalizedAddress?: string;
  readonly error: "CONTRACT_NOT_FOUND" | "INVALID_ADDRESS";
  readonly message: string;
}

export type ContractLookupResult = ContractLookupSuccess | ContractLookupNotFound;
