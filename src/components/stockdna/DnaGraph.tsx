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
        maxWidth: "1320px",
        margin: "0 auto",
        padding: "1.5rem 1.25rem 3rem",
      }}
    >
      {/* 1. Underlying Root Node */}
      <div className="animate-fade-in">
        <UnderlyingNode equity={underlying} representationCount={count} />
      </div>

      {/* 2. Desktop Kin Map Curved SVG Connectors */}
      <div
        className="kin-desktop-connector"
        style={{
          position: "relative",
          width: "100%",
          height: count > 1 ? "54px" : "36px",
          display: "none",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1000 54"
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
                y2="36"
                stroke="var(--accent-primary)"
                strokeWidth="2"
                className="kin-branch-active"
              />
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />
              <circle cx="500" cy="36" r="3.5" fill="var(--accent-primary)" />
            </g>
          )}

          {count === 2 && (
            /* 2-way curved branch */
            <g>
              {/* Origin central node */}
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />

              {/* Left smooth bezier curve */}
              <path
                d="M 500 0 C 500 28, 280 26, 280 54"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.75"
                className="kin-branch-active"
              />
              <circle cx="280" cy="54" r="3.5" fill="var(--accent-primary)" />

              {/* Right smooth bezier curve */}
              <path
                d="M 500 0 C 500 28, 720 26, 720 54"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.75"
                className="kin-branch-active"
              />
              <circle cx="720" cy="54" r="3.5" fill="var(--accent-primary)" />
            </g>
          )}

          {count >= 3 && (
            /* 3-way or multi-way smooth curved branches */
            <g>
              {/* Origin central node */}
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />

              {/* Left smooth curved branch */}
              <path
                d="M 500 0 C 500 28, 175 26, 175 54"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.75"
                className="kin-branch-active"
              />
              <circle cx="175" cy="54" r="3.5" fill="var(--accent-primary)" />

              {/* Center direct branch */}
              <line
                x1="500"
                y1="0"
                x2="500"
                y2="54"
                stroke="var(--accent-primary)"
                strokeWidth="1.75"
                className="kin-branch-active"
              />
              <circle cx="500" cy="54" r="3.5" fill="var(--accent-primary)" />

              {/* Right smooth curved branch */}
              <path
                d="M 500 0 C 500 28, 825 26, 825 54"
                fill="none"
                stroke="var(--accent-primary)"
                strokeWidth="1.75"
                className="kin-branch-active"
              />
              <circle cx="825" cy="54" r="3.5" fill="var(--accent-primary)" />
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
              ? "maxw(520px, 1fr)"
              : count === 2
              ? "repeat(2, 1fr)"
              : "repeat(3, 1fr)"};
            max-width: ${count === 1 ? "520px" : "100%"};
            margin: ${count === 1 ? "0 auto" : "0"};
            gap: 1.5rem;
          }
          .kin-card-wrapper {
            display: block;
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
            gap: 1.15rem;
            margin-top: 1.5rem;
            padding-left: 0.5rem;
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
