"use client";

import { useState, use } from "react";
import { useSearchParams } from "next/navigation";
import { useTickerKin } from "@/hooks/useStockDna";
import type { EvidenceRecord } from "@/types/provenance";
import type { TokenizedRepresentation } from "@/types/token";
import { DnaGraph } from "@/components/stockdna/DnaGraph";
import { EvidenceDrawer } from "@/components/stockdna/EvidenceDrawer";
import { RepresentationDetailDrawer } from "@/components/stockdna/RepresentationDetailDrawer";
import { LoadingSkeleton } from "@/components/stockdna/LoadingSkeleton";
import { ErrorBanner } from "@/components/stockdna/ErrorBanner";

interface KinMapPageProps {
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default function KinMapPage({ params }: KinMapPageProps) {
  const { ticker } = use(params);
  const searchParams = useSearchParams();
  const matchedAddress = searchParams.get("match") ?? undefined;

  const { data, loading, error, search } = useTickerKin(ticker);
  const [activeEvidence, setActiveEvidence] = useState<EvidenceRecord | null>(null);
  const [selectedRep, setSelectedRep] = useState<TokenizedRepresentation | null>(null);

  // If matchedAddress is provided in URL, pass it to data for highlight
  const resolvedData = data
    ? {
        ...data,
        matchedContractAddress: matchedAddress ?? data.matchedContractAddress,
      }
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {loading && <LoadingSkeleton />}

      {!loading && error && (
        <ErrorBanner error={error} onReset={() => search(ticker)} />
      )}

      {!loading && resolvedData && (
        <DnaGraph
          data={resolvedData}
          onInspectEvidence={(ev) => setActiveEvidence(ev)}
          onInspectRepresentation={(rep) => setSelectedRep(rep)}
        />
      )}

      {/* Slide-Over Evidence Drawer */}
      <EvidenceDrawer
        evidence={activeEvidence}
        onClose={() => setActiveEvidence(null)}
      />

      {/* Slide-Over Representation Intelligence Drawer */}
      {resolvedData && (
        <RepresentationDetailDrawer
          representation={selectedRep}
          underlying={resolvedData.underlying}
          onClose={() => setSelectedRep(null)}
        />
      )}
    </div>
  );
}
