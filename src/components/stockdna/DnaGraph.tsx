"use client";

import { useState } from "react";
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
  const [highlightedContract, setHighlightedContract] = useState<string | null>(null);

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
      <div className="tk-enter-1">
        <UnderlyingNode equity={underlying} representationCount={count} />
      </div>

      {/* 2. Desktop Kin Map Solid Hairline Curved SVG Connectors with Travelling Highlight */}
      <div
        className="kin-desktop-connector tk-enter-2"
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
            <g
              style={{
                transition: "opacity 0.2s ease",
              }}
            >
              <line
                x1="500"
                y1="0"
                x2="500"
                y2="32"
                stroke={highlightedContract === representations[0]?.contractAddress ? "var(--accent-primary)" : "#CBD5E1"}
                strokeWidth={highlightedContract === representations[0]?.contractAddress ? 2.5 : 1.5}
              />
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />
              <circle
                cx="500"
                cy="32"
                r={highlightedContract === representations[0]?.contractAddress ? 4 : 3}
                fill={highlightedContract === representations[0]?.contractAddress ? "var(--accent-primary)" : "#94A3B8"}
              />

              {/* Travelling Kin Dash Flow Overlay */}
              <line
                x1="500"
                y1="0"
                x2="500"
                y2="32"
                stroke="var(--accent-primary)"
                strokeWidth={highlightedContract === representations[0]?.contractAddress ? 2.75 : 2}
                className="kin-flow-line kin-flow-line-1"
              />
            </g>
          )}

          {count === 2 && (
            /* 2-way curved branch */
            <g>
              {/* Origin central node in TickerKin Blue */}
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />

              {/* Left Branch (Index 0) */}
              <g
                style={{
                  transition: "opacity 0.2s ease",
                  opacity: highlightedContract !== null && highlightedContract !== representations[0]?.contractAddress ? 0.35 : 1,
                }}
              >
                <path
                  d="M 500 0 C 500 24, 280 24, 280 48"
                  fill="none"
                  stroke={highlightedContract === representations[0]?.contractAddress ? "var(--accent-primary)" : "#CBD5E1"}
                  strokeWidth={highlightedContract === representations[0]?.contractAddress ? 2.5 : 1.5}
                />
                <circle
                  cx="280"
                  cy="48"
                  r={highlightedContract === representations[0]?.contractAddress ? 4 : 3}
                  fill={highlightedContract === representations[0]?.contractAddress ? "var(--accent-primary)" : "#94A3B8"}
                />
                <path
                  d="M 500 0 C 500 24, 280 24, 280 48"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth={highlightedContract === representations[0]?.contractAddress ? 2.75 : 2}
                  className="kin-flow-line kin-flow-line-1"
                />
              </g>

              {/* Right Branch (Index 1) */}
              <g
                style={{
                  transition: "opacity 0.2s ease",
                  opacity: highlightedContract !== null && highlightedContract !== representations[1]?.contractAddress ? 0.35 : 1,
                }}
              >
                <path
                  d="M 500 0 C 500 24, 720 24, 720 48"
                  fill="none"
                  stroke={highlightedContract === representations[1]?.contractAddress ? "var(--accent-primary)" : "#CBD5E1"}
                  strokeWidth={highlightedContract === representations[1]?.contractAddress ? 2.5 : 1.5}
                />
                <circle
                  cx="720"
                  cy="48"
                  r={highlightedContract === representations[1]?.contractAddress ? 4 : 3}
                  fill={highlightedContract === representations[1]?.contractAddress ? "var(--accent-primary)" : "#94A3B8"}
                />
                <path
                  d="M 500 0 C 500 24, 720 24, 720 48"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth={highlightedContract === representations[1]?.contractAddress ? 2.75 : 2}
                  className="kin-flow-line kin-flow-line-2"
                />
              </g>
            </g>
          )}

          {count >= 3 && (
            /* 3-way smooth solid curved branches */
            <g>
              {/* Origin central node in TickerKin Blue */}
              <circle cx="500" cy="0" r="3.5" fill="var(--accent-primary)" />

              {/* Left Branch (Index 0) */}
              <g
                style={{
                  transition: "opacity 0.2s ease",
                  opacity: highlightedContract !== null && highlightedContract !== representations[0]?.contractAddress ? 0.35 : 1,
                }}
              >
                <path
                  d="M 500 0 C 500 24, 175 24, 175 48"
                  fill="none"
                  stroke={highlightedContract === representations[0]?.contractAddress ? "var(--accent-primary)" : "#CBD5E1"}
                  strokeWidth={highlightedContract === representations[0]?.contractAddress ? 2.5 : 1.5}
                />
                <circle
                  cx="175"
                  cy="48"
                  r={highlightedContract === representations[0]?.contractAddress ? 4 : 3}
                  fill={highlightedContract === representations[0]?.contractAddress ? "var(--accent-primary)" : "#94A3B8"}
                />
                <path
                  d="M 500 0 C 500 24, 175 24, 175 48"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth={highlightedContract === representations[0]?.contractAddress ? 2.75 : 2}
                  className="kin-flow-line kin-flow-line-1"
                />
              </g>

              {/* Center Branch (Index 1) */}
              <g
                style={{
                  transition: "opacity 0.2s ease",
                  opacity: highlightedContract !== null && highlightedContract !== representations[1]?.contractAddress ? 0.35 : 1,
                }}
              >
                <line
                  x1="500"
                  y1="0"
                  x2="500"
                  y2="48"
                  stroke={highlightedContract === representations[1]?.contractAddress ? "var(--accent-primary)" : "#CBD5E1"}
                  strokeWidth={highlightedContract === representations[1]?.contractAddress ? 2.5 : 1.5}
                />
                <circle
                  cx="500"
                  cy="48"
                  r={highlightedContract === representations[1]?.contractAddress ? 4 : 3}
                  fill={highlightedContract === representations[1]?.contractAddress ? "var(--accent-primary)" : "#94A3B8"}
                />
                <line
                  x1="500"
                  y1="0"
                  x2="500"
                  y2="48"
                  stroke="var(--accent-primary)"
                  strokeWidth={highlightedContract === representations[1]?.contractAddress ? 2.75 : 2}
                  className="kin-flow-line kin-flow-line-2"
                />
              </g>

              {/* Right Branch (Index 2) */}
              <g
                style={{
                  transition: "opacity 0.2s ease",
                  opacity: highlightedContract !== null && highlightedContract !== representations[2]?.contractAddress ? 0.35 : 1,
                }}
              >
                <path
                  d="M 500 0 C 500 24, 825 24, 825 48"
                  fill="none"
                  stroke={highlightedContract === representations[2]?.contractAddress ? "var(--accent-primary)" : "#CBD5E1"}
                  strokeWidth={highlightedContract === representations[2]?.contractAddress ? 2.5 : 1.5}
                />
                <circle
                  cx="825"
                  cy="48"
                  r={highlightedContract === representations[2]?.contractAddress ? 4 : 3}
                  fill={highlightedContract === representations[2]?.contractAddress ? "var(--accent-primary)" : "#94A3B8"}
                />
                <path
                  d="M 500 0 C 500 24, 825 24, 825 48"
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth={highlightedContract === representations[2]?.contractAddress ? 2.75 : 2}
                  className="kin-flow-line kin-flow-line-3"
                />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* 3. Representation Cards Container (Desktop Grid / Mobile Vertical Lineage) */}
      <div className={`kin-representations-container kin-count-${count <= 1 ? 1 : count === 2 ? 2 : 3} tk-enter-3`}>
        {representations.map((rep, idx) => {
          const isTargetMatch = matchedContractAddress
            ? rep.contractAddress.toLowerCase() === matchedContractAddress.toLowerCase()
            : false;

          const isHighlighted = highlightedContract === rep.contractAddress;
          const isQuieted = highlightedContract !== null && !isHighlighted;
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
                  isHighlighted={isHighlighted}
                  isQuieted={isQuieted}
                  onHoverChange={(hovered) =>
                    setHighlightedContract(hovered ? rep.contractAddress : null)
                  }
                  onSelectToggle={() =>
                    setHighlightedContract((prev) =>
                      prev === rep.contractAddress ? null : rep.contractAddress
                    )
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Backward-compatible alias
export const KinMap = DnaGraph;
