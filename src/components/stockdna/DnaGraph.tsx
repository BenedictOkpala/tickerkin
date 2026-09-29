"use client";

import type { TickerKinResolvedData } from "@/hooks/useStockDna";
import type { EvidenceRecord } from "@/types/provenance";
import type { TokenizedRepresentation } from "@/types/token";
import { UnderlyingNode } from "./UnderlyingNode";
import { RepresentationCard } from "./RepresentationCard";

interface DnaGraphProps {
  readonly data: TickerKinResolvedData;
  readonly onInspectEvidence: (evidence: EvidenceRecord) => void;
  readonly onInspectRepresentation?: (representation: TokenizedRepresentation) => void;
}

export function DnaGraph({ data, onInspectEvidence, onInspectRepresentation }: DnaGraphProps) {
  const { underlying, representations, matchedContractAddress } = data;
  const count = representations.length;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "1.25rem 1.5rem 2rem",
      }}
    >
      {/* 1. Underlying Root Node */}
      <div className="animate-fade-in">
        <UnderlyingNode equity={underlying} representationCount={count} />
      </div>

      {/* 2. Desktop Kin Map Solid Hairline Curved SVG Connectors */}
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
          viewBox="0 0 1000 48"
          preserveAspectRatio="none"
          style={{ overflow: "visible", position: "absolute", top: 0, left: 0 }}
        >
          {count === 1 && (
            /* Single branch straight down */
            <g>
              <line
                x1="500"
                y1="0"
                x2="500"
                y2="32"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />
              <circle cx="500" cy="32" r="3" fill="#94A3B8" />
            </g>
          )}

          {count === 2 && (
            /* 2-way curved branch */
            <g>
              {/* Origin central node in TickerKin Blue */}
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />

              {/* Left smooth solid bezier curve */}
              <path
                d="M 500 0 C 500 24, 280 24, 280 48"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <circle cx="280" cy="48" r="3" fill="#94A3B8" />

              {/* Right smooth solid bezier curve */}
              <path
                d="M 500 0 C 500 24, 720 24, 720 48"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <circle cx="720" cy="48" r="3" fill="#94A3B8" />
            </g>
          )}

          {count >= 3 && (
            /* 3-way smooth solid curved branches */
            <g>
              {/* Origin central node in TickerKin Blue */}
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />

              {/* Left smooth curved branch */}
              <path
                d="M 500 0 C 500 24, 175 24, 175 48"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <circle cx="175" cy="48" r="3" fill="#94A3B8" />

              {/* Center direct branch */}
              <line
                x1="500"
                y1="0"
                x2="500"
                y2="48"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <circle cx="500" cy="48" r="3" fill="#94A3B8" />

              {/* Right smooth curved branch */}
              <path
                d="M 500 0 C 500 24, 825 24, 825 48"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
              />
              <circle cx="825" cy="48" r="3" fill="#94A3B8" />
            </g>
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
                    height: isLast ? "28px" : "100%",
                  }}
                />
                <div className="kin-mobile-dot" />
              </div>

              {/* Card Component */}
              <div style={{ flex: 1, width: "100%" }}>
                <RepresentationCard
                  representation={rep}
                  onInspectEvidence={onInspectEvidence}
                  onInspectRepresentation={onInspectRepresentation}
                  isTargetMatch={isTargetMatch}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Responsive Styles for Desktop / Mobile Kin Map layout */}
      <style jsx>{`
        @media (min-width: 880px) {
          .kin-desktop-connector {
            display: flex !important;
          }
          .kin-representations-container {
            display: grid;
            grid-template-columns: ${count === 1
              ? "minmax(340px, 480px)"
              : count === 2
              ? "repeat(2, minmax(320px, 1fr))"
              : "repeat(3, minmax(300px, 1fr))"};
            max-width: ${count === 1 ? "480px" : "100%"};
            margin: ${count === 1 ? "0 auto" : "0"};
            gap: 1.75rem;
            align-items: stretch;
          }
          .kin-card-wrapper {
            display: flex;
            height: 100%;
          }
          .kin-mobile-connector-node {
            display: none !important;
          }
        }

        @media (max-width: 879px) {
          .kin-desktop-connector {
            display: none !important;
          }
          .kin-representations-container {
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            margin-top: 1.25rem;
            padding-left: 0.25rem;
          }
          .kin-card-wrapper {
            display: flex;
            align-items: stretch;
            position: relative;
            width: 100%;
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
            top: 28px;
            left: 8px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: var(--accent-primary);
            border: 2px solid var(--bg-surface);
            z-index: 2;
          }
        }
      `}</style>
    </div>
  );
}

// Backward-compatible alias
export const KinMap = DnaGraph;
