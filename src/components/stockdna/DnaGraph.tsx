"use client";

import type { StockDnaResolvedData } from "@/hooks/useStockDna";
import type { EvidenceRecord } from "@/types/provenance";
import { UnderlyingNode } from "./UnderlyingNode";
import { RepresentationCard } from "./RepresentationCard";

interface DnaGraphProps {
  readonly data: StockDnaResolvedData;
  readonly onInspectEvidence: (evidence: EvidenceRecord) => void;
}

export function DnaGraph({ data, onInspectEvidence }: DnaGraphProps) {
  const { underlying, representations, matchedContractAddress } = data;

  return (
    <div style={{ width: "100%", maxWidth: "1180px", margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      {/* 1. Underlying Anchor Node */}
      <div className="animate-fade-in">
        <UnderlyingNode equity={underlying} representationCount={representations.length} />
      </div>

      {/* 2. Visual Branch Connector Lines (Desktop Spatial Canvas) */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "45px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ overflow: "visible", position: "absolute", top: 0, left: 0 }}
        >
          {/* Central Stem from Origin */}
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="45"
            stroke="var(--accent-gold)"
            strokeWidth="2"
            className="dna-connector-path"
          />
        </svg>
      </div>

      {/* 3. Representation Branch Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
          position: "relative",
          zIndex: 1,
        }}
        className="animate-fade-in"
      >
        {representations.map((rep) => {
          const isTargetMatch = matchedContractAddress
            ? rep.contractAddress.toLowerCase() === matchedContractAddress.toLowerCase()
            : false;

          return (
            <RepresentationCard
              key={rep.contractAddress}
              representation={rep}
              onInspectEvidence={onInspectEvidence}
              isTargetMatch={isTargetMatch}
            />
          );
        })}
      </div>
    </div>
  );
}
