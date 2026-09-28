import type { PricePoint } from "./price";
import type { EvidenceRecord } from "./provenance";

export interface TraditionalMarketHours {
  readonly isOpen: boolean;
  readonly nextOpen?: number;
  readonly nextClose?: number;
  readonly schedule?: string;
  readonly timezone?: string;
}

export interface UnderlyingEquity {
  readonly ticker: string;
  readonly name: string;
  readonly exchange?: string;
  readonly quoteCurrency: string;
  readonly marketHours?: TraditionalMarketHours;
  readonly referencePrice?: PricePoint;
  readonly provenance: EvidenceRecord;
}
