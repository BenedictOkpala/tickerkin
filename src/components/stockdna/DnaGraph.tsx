"use client";

import type { TickerKinResolvedData } from "@/hooks/useStockDna";
import type { EvidenceRecord } from "@/types/provenance";
import { UnderlyingNode } from "./UnderlyingNode";
import { RepresentationCard } from "./RepresentationCard";

interface DnaGraphProps {
  readonly data: TickerKinResolvedData;
  readonly onInspectEvidence: (evidence: EvidenceRecord) => void;
}

export function DnaGraph({ data, onInspectEvidence }: DnaGraphProps) {
  const { underlying, representations, matchedContractAddress } = data;
  const count = representations.length;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1240px",
        margin: "0 auto",
        padding: "1.25rem 1rem 2.5rem",
      }}
    >
      {/* 1. Underlying Root Node */}
      <div className="animate-fade-in">
        <UnderlyingNode equity={underlying} representationCount={count} />
      </div>

      {/* 2. Desktop Kin Map Branching SVG Connectors (hidden on small screens) */}
      <div
        className="kin-desktop-connector"
        style={{
          position: "relative",
          width: "100%",
          height: count > 1 ? "48px" : "32px",
          display: "none",
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{ overflow: "visible", position: "absolute", top: 0, left: 0 }}
        >
          {count === 1 && (
            /* Single branch straight down */
            <>
              <line
                x1="50%"
                y1="0"
                x2="50%"
                y2="32"
                className="kin-branch-active"
                strokeWidth="2"
              />
              <circle cx="50%" cy="32" r="3" fill="var(--accent-primary)" />
            </>
          )}

          {count === 2 && (
            /* 2-way branch */
            <>
              {/* Central stem */}
              <line x1="50%" y1="0" x2="50%" y2="24" className="kin-branch-active" strokeWidth="2" />
              {/* Horizontal junction bar */}
              <line x1="28%" y1="24" x2="72%" y2="24" stroke="var(--border-card)" strokeWidth="1.5" />
              {/* Left drop */}
              <line x1="28%" y1="24" x2="28%" y2="48" className="kin-branch-active" strokeWidth="2" />
              <circle cx="28%" cy="48" r="3" fill="var(--accent-primary)" />
              {/* Right drop */}
              <line x1="72%" y1="24" x2="72%" y2="48" className="kin-branch-active" strokeWidth="2" />
              <circle cx="72%" cy="48" r="3" fill="var(--accent-primary)" />
            </>
          )}

          {count >= 3 && (
            /* 3-way or multi-way branch */
            <>
              {/* Central stem */}
              <line x1="50%" y1="0" x2="50%" y2="24" className="kin-branch-active" strokeWidth="2" />
              {/* Horizontal junction bus spanning across columns */}
              <line x1="17%" y1="24" x2="83%" y2="24" stroke="var(--border-card)" strokeWidth="1.5" />
              {/* Left drop */}
              <line x1="17%" y1="24" x2="17%" y2="48" className="kin-branch-active" strokeWidth="2" />
              <circle cx="17%" cy="48" r="3" fill="var(--accent-primary)" />
              {/* Center drop */}
              <line x1="50%" y1="24" x2="50%" y2="48" className="kin-branch-active" strokeWidth="2" />
              <circle cx="50%" cy="48" r="3" fill="var(--accent-primary)" />
              {/* Right drop */}
              <line x1="83%" y1="24" x2="83%" y2="48" className="kin-branch-active" strokeWidth="2" />
              <circle cx="83%" cy="48" r="3" fill="var(--accent-primary)" />
            </>
          )}
        </svg>
      </div>

      {/* 3. Representation Cards Container (Desktop Grid / Mobile Vertical Lineage) */}
      <div className="kin-representations-container animate-fade-in">
        {representations.map((rep, idx) => {
          const isTargetMatch = matchedContractAddress
            ? rep.contractAddress.toLowerCase() === matchedContractAddress.toLowerCase()
            : false;

          const isLast = idx === representations.length - 1;

          return (
            <div key={rep.contractAddress} className="kin-card-wrapper">
              {/* Mobile Vertical Lineage Connector node */}
              <div className="kin-mobile-connector-node">
                <div
                  className="kin-mobile-line"
                  style={{
                    height: isLast ? "24px" : "100%",
                  }}
                />
                <div className="kin-mobile-dot" />
              </div>

              {/* Card Component */}
              <div style={{ flex: 1 }}>
                <RepresentationCard
                  representation={rep}
                  onInspectEvidence={onInspectEvidence}
                  isTargetMatch={isTargetMatch}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Styles for Desktop / Mobile Kin Map layout */}
      <style jsx>{`
        @media (min-width: 860px) {
          .kin-desktop-connector {
            display: flex !important;
          }
          .kin-representations-container {
            display: grid;
            grid-template-columns: ${count === 1
              ? "maxw(480px, 1fr)"
              : count === 2
              ? "repeat(2, 1fr)"
              : "repeat(3, 1fr)"};
            max-width: ${count === 1 ? "480px" : "100%"};
            margin: ${count === 1 ? "0 auto" : "0"};
            gap: 1.25rem;
          }
          .kin-card-wrapper {
            display: block;
          }
          .kin-mobile-connector-node {
            display: none !important;
          }
        }

        @media (max-width: 859px) {
          .kin-desktop-connector {
            display: none !important;
          }
          .kin-representations-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 1.25rem;
            padding-left: 0.5rem;
          }
          .kin-card-wrapper {
            display: flex;
            align-items: stretch;
            position: relative;
          }
          .kin-mobile-connector-node {
            position: relative;
            width: 24px;
            margin-right: 0.75rem;
            display: flex;
            justifyContent: center;
          }
          .kin-mobile-line {
            position: absolute;
            top: 0;
            left: 11px;
            width: 2px;
            background-color: var(--border-card);
          }
          .kin-mobile-dot {
            position: absolute;
            top: 24px;
            left: 8px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--accent-primary);
            border: 2px solid var(--bg-app);
            z-index: 2;
          }
        }
      `}</style>
    </div>
  );
}

// Backward-compatible alias
export const KinMap = DnaGraph;
