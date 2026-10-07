import { getFactorFreshness } from "@/lens/freshness";
import { rwaLens } from "@/lens/engine";
import {
  formatEconomicMechanism,
  formatDividendHandling,
  getMechanismExplanation,
  getClaimScopedEvidence,
  type ClaimScopedEvidence,
} from "@/lens/presentation";
import type { TokenizedRepresentation } from "@/types/token";
import type { UnderlyingEquity } from "@/types/equity";

export interface ResolveEquityParams {
  readonly ticker: string;
}

export interface ResolveContractParams {
  readonly contractAddress: string;
}

export interface CompareRepresentationsParams {
  readonly ticker: string;
}

export interface GetEvidenceParams {
  readonly ticker: string;
  readonly providerId?: string;
}

export interface FormattedAgentRepresentation {
  readonly symbol: string;
  readonly name: string;
  readonly providerId: string;
  readonly providerName: string;
  readonly issuer: string;
  readonly chain: string;
  readonly chainId: number;
  readonly contractAddress: string;
  readonly tokenStandard: string;
  readonly decimals: number;
  readonly status: string;
  readonly economicModel: {
    readonly id: string;
    readonly label: string;
    readonly description: string;
    readonly dividendHandling: string;
    readonly currentFactor?: number;
  };
  readonly liveEnrichment: {
    readonly status: "active" | "unavailable";
    readonly factor?: string;
    readonly factorValue?: number;
    readonly confidence?: string;
    readonly matchBasis?: string;
    readonly lastUpdated?: string;
    readonly freshness?: "LIVE" | "CACHED" | "SNAPSHOT" | "UNAVAILABLE";
    readonly message?: string;
  };
  readonly evidence: readonly ClaimScopedEvidence[];
}

export type ResolveEquityResult =
  | {
      readonly success: true;
      readonly query: string;
      readonly underlying: {
        readonly ticker: string;
        readonly name: string;
        readonly exchange: string;
        readonly quoteCurrency: string;
        readonly marketHoursSchedule?: string;
      };
      readonly chain: string;
      readonly chainId: number;
      readonly representationsCount: number;
      readonly representations: readonly FormattedAgentRepresentation[];
    }
  | {
      readonly success: false;
      readonly query: string;
      readonly error: string;
      readonly message: string;
    };

export type ResolveContractResult =
  | {
      readonly success: true;
      readonly query: string;
      readonly normalizedAddress: string;
      readonly chain: string;
      readonly chainId: number;
      readonly underlying: {
        readonly ticker: string;
        readonly name: string;
        readonly exchange: string;
        readonly quoteCurrency: string;
      };
      readonly matchedRepresentation: FormattedAgentRepresentation;
    }
  | {
      readonly success: false;
      readonly query: string;
      readonly normalizedAddress?: string;
      readonly error: string;
      readonly message: string;
    };

export interface ComparisonDimensionItem {
  readonly symbol: string;
  readonly providerId: string;
  readonly providerName: string;
  readonly issuer: string;
  readonly chain: string;
  readonly contractAddress: string;
  readonly tokenStandard: string;
  readonly economicMechanism: {
    readonly id: string;
    readonly label: string;
  };
  readonly mechanismDescription: string;
  readonly dividendHandling: string;
  readonly dynamicFactorStatus: string;
  readonly evidenceSummary: string;
}

export interface MechanismDifferenceGuideItem {
  readonly mechanism: string;
  readonly mechanismId: string;
  readonly subtitle: string;
  readonly description: string;
  readonly behaviorDetail: string;
}

export type CompareRepresentationsResult =
  | {
      readonly success: true;
      readonly query: string;
      readonly underlying: {
        readonly ticker: string;
        readonly name: string;
        readonly quoteCurrency: string;
      };
      readonly representationsCount: number;
      readonly comparisonDimensions: readonly ComparisonDimensionItem[];
      readonly mechanismDifferencesGuide: readonly MechanismDifferenceGuideItem[];
      readonly safetyNotice: string;
    }
  | {
      readonly success: false;
      readonly query: string;
      readonly error: string;
      readonly message: string;
    };

export interface RepresentationEvidenceItem {
  readonly tokenSymbol: string;
  readonly tokenName: string;
  readonly providerId: string;
  readonly providerName: string;
  readonly issuer: string;
  readonly contractAddress: string;
  readonly claims: readonly ClaimScopedEvidence[];
}

export type GetEvidenceResult =
  | {
      readonly success: true;
      readonly query: string;
      readonly underlying: {
        readonly ticker: string;
        readonly name: string;
        readonly benchmarkEvidence: {
          readonly sourceName: string;
          readonly sourceClass: string;
          readonly confidence: string;
          readonly sourceRef?: string;
          readonly notes?: string;
        };
      };
      readonly representationsEvidence: readonly RepresentationEvidenceItem[];
    }
  | {
      readonly success: false;
      readonly query: string;
      readonly error: string;
      readonly message: string;
      readonly availableProviders?: readonly string[];
    };

export interface ListEquitiesResult {
  readonly success: true;
  readonly catalogScope: string;
  readonly totalIndexedEquities: number;
  readonly equities: readonly {
    readonly ticker: string;
    readonly company: string;
    readonly exchange: string;
    readonly quoteCurrency: string;
    readonly verifiedRepresentationCount: number;
    readonly providersOnBsc: readonly string[];
    readonly primaryChain: string;
  }[];
  readonly boundaryNotice: string;
}

/**
 * Normalizes representation object into agent-friendly JSON structure.
 */
function formatRepresentationForAgent(rep: TokenizedRepresentation, underlying: UnderlyingEquity): FormattedAgentRepresentation {
  const isScale = "currentScaleFactor" in rep.economicModel ? rep.economicModel.currentScaleFactor : undefined;
  const isMult = "currentMultiplier" in rep.economicModel ? rep.economicModel.currentMultiplier : undefined;
  const isRate = "currentRate" in rep.economicModel ? rep.economicModel.currentRate : undefined;
  const dynamicFactorValue = isScale ?? isMult ?? isRate;

  return {
    symbol: rep.tokenSymbol,
    name: rep.tokenName,
    providerId: rep.providerId,
    providerName: rep.providerName,
    issuer: rep.issuer,
    chain: rep.chain,
    chainId: rep.chainId,
    contractAddress: rep.contractAddress,
    tokenStandard: rep.tokenStandard,
    decimals: rep.decimals,
    status: rep.status,
    economicModel: {
      id: rep.economicModel.mechanism,
      label: formatEconomicMechanism(rep.economicModel.mechanism),
      description: rep.economicModel.description,
      dividendHandling: formatDividendHandling(
        "dividendHandling" in rep.economicModel ? rep.economicModel.dividendHandling : undefined
      ),
      currentFactor: dynamicFactorValue,
    },
    liveEnrichment: rep.liveEnrichment
      ? {
          status: "active",
          factor: rep.liveEnrichment.rawMultiplier,
          factorValue: rep.liveEnrichment.multiplierValue,
          confidence: rep.liveEnrichment.matchConfidence,
          matchBasis: rep.liveEnrichment.matchBasis,
          lastUpdated: rep.liveEnrichment.lastUpdateIso,
          freshness: getFactorFreshness(rep.liveEnrichment),
        }
      : {
          status: "unavailable",
          message: "Live factor not available; operating on verified structural baseline",
        },
    evidence: getClaimScopedEvidence(rep, underlying),
  };
}

/**
 * 1. resolve_equity Tool Handler
 */
export async function handleResolveEquity({ ticker }: ResolveEquityParams): Promise<ResolveEquityResult> {
  const result = await rwaLens.lookupByTickerAsync(ticker);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      message: result.message,
      query: ticker,
    };
  }

  const { underlying, representations } = result;

  return {
    success: true,
    query: ticker,
    underlying: {
      ticker: underlying.ticker,
      name: underlying.name,
      exchange: underlying.exchange ?? "NASDAQ",
      quoteCurrency: underlying.quoteCurrency,
      marketHoursSchedule: underlying.marketHours?.schedule,
    },
    chain: "BNB Smart Chain",
    chainId: 56,
    representationsCount: representations.length,
    representations: representations.map((r) => formatRepresentationForAgent(r, underlying)),
  };
}

/**
 * 2. resolve_contract Tool Handler
 */
export async function handleResolveContract({ contractAddress }: ResolveContractParams): Promise<ResolveContractResult> {
  const result = await rwaLens.lookupByContractAsync(contractAddress);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      message: result.message,
      query: contractAddress,
      normalizedAddress: result.normalizedAddress,
    };
  }

  const { underlying, matchedRepresentation, normalizedAddress } = result;

  return {
    success: true,
    query: contractAddress,
    normalizedAddress,
    chain: "BNB Smart Chain",
    chainId: 56,
    underlying: {
      ticker: underlying.ticker,
      name: underlying.name,
      exchange: underlying.exchange ?? "NASDAQ",
      quoteCurrency: underlying.quoteCurrency,
    },
    matchedRepresentation: formatRepresentationForAgent(matchedRepresentation, underlying),
  };
}

/**
 * 3. compare_representations Tool Handler
 */
export async function handleCompareRepresentations({ ticker }: CompareRepresentationsParams): Promise<CompareRepresentationsResult> {
  const result = await rwaLens.lookupByTickerAsync(ticker);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      message: result.message,
      query: ticker,
    };
  }

  const { underlying, representations } = result;

  const comparisonDimensions: ComparisonDimensionItem[] = representations.map((r) => ({
    symbol: r.tokenSymbol,
    providerId: r.providerId,
    providerName: r.providerName,
    issuer: r.issuer,
    chain: r.chain,
    contractAddress: r.contractAddress,
    tokenStandard: `${r.tokenStandard} (${r.decimals} decimals)`,
    economicMechanism: {
      id: r.economicModel.mechanism,
      label: formatEconomicMechanism(r.economicModel.mechanism),
    },
    mechanismDescription: r.economicModel.description,
    dividendHandling: formatDividendHandling(
      "dividendHandling" in r.economicModel ? r.economicModel.dividendHandling : undefined
    ),
    dynamicFactorStatus: r.liveEnrichment
      ? `${getFactorFreshness(r.liveEnrichment) === "LIVE" ? "Live" : "Cached"} factor active (${r.liveEnrichment.rawMultiplier})`
      : "Static baseline (live feed unavailable)",
    evidenceSummary: `${r.provenance.sourceClass} · ${r.provenance.confidence} confidence`,
  }));

  const uniqueMechanisms = Array.from(new Set(representations.map((r) => r.economicModel.mechanism)));
  const mechanismDifferencesGuide: MechanismDifferenceGuideItem[] = uniqueMechanisms.map((m) => {
    const exp = getMechanismExplanation(m);
    return {
      mechanism: exp.title,
      mechanismId: exp.mechanismKey,
      subtitle: exp.subtitle,
      description: exp.description,
      behaviorDetail: exp.behaviorDetail,
    };
  });

  return {
    success: true,
    query: ticker,
    underlying: {
      ticker: underlying.ticker,
      name: underlying.name,
      quoteCurrency: underlying.quoteCurrency,
    },
    representationsCount: representations.length,
    comparisonDimensions,
    mechanismDifferencesGuide,
    safetyNotice: "RWA Lens provides deterministic technical and structural comparisons. It does not provide investment advice or rank representations.",
  };
}

/**
 * 4. get_evidence Tool Handler
 */
export async function handleGetEvidence({ ticker, providerId }: GetEvidenceParams): Promise<GetEvidenceResult> {
  const result = rwaLens.lookupByTicker(ticker);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      message: result.message,
      query: ticker,
    };
  }

  const { underlying, representations } = result;
  const filtered = providerId
    ? representations.filter((r) => r.providerId.toLowerCase() === providerId.toLowerCase())
    : representations;

  if (providerId && filtered.length === 0) {
    return {
      success: false,
      query: ticker,
      error: "PROVIDER_REPRESENTATION_NOT_FOUND",
      message: `No verified representation found for provider '${providerId}' under equity '${ticker}'.`,
      availableProviders: representations.map((r) => r.providerId),
    };
  }

  return {
    success: true,
    query: ticker,
    underlying: {
      ticker: underlying.ticker,
      name: underlying.name,
      benchmarkEvidence: {
        sourceName: underlying.provenance.sourceName,
        sourceClass: underlying.provenance.sourceClass,
        confidence: underlying.provenance.confidence,
        sourceRef: underlying.provenance.sourceRef,
        notes: underlying.provenance.notes,
      },
    },
    representationsEvidence: filtered.map((rep) => ({
      tokenSymbol: rep.tokenSymbol,
      tokenName: rep.tokenName,
      providerId: rep.providerId,
      providerName: rep.providerName,
      issuer: rep.issuer,
      contractAddress: rep.contractAddress,
      claims: getClaimScopedEvidence(rep, underlying),
    })),
  };
}

/**
 * 5. list_equities Tool Handler (Discovery)
 */
export async function handleListEquities(): Promise<ListEquitiesResult> {
  const catalog = rwaLens.getEquitiesCatalog();

  return {
    success: true,
    catalogScope: "Curated verified tokenized equity representations on BNB Smart Chain (Chain ID: 56).",
    totalIndexedEquities: catalog.length,
    equities: catalog.map((e) => ({
      ticker: e.ticker,
      company: e.name,
      exchange: e.exchange ?? "NASDAQ",
      quoteCurrency: e.quoteCurrency,
      verifiedRepresentationCount: e.representationCount,
      providersOnBsc: e.providerIds,
      primaryChain: e.chain,
    })),
    boundaryNotice: "This catalog reflects the curated and evidence-audited set of tokenized equities indexed by RWA Lens on BNB Smart Chain, rather than universal global multi-chain issuance.",
  };
}
