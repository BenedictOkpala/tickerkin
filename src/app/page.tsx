"use client";

import { useState } from "react";
import { useTickerKin } from "@/hooks/useStockDna";
import type { EvidenceRecord } from "@/types/provenance";
import { SearchHeader } from "@/components/stockdna/SearchHeader";
import { DnaGraph } from "@/components/stockdna/DnaGraph";
import { EvidenceDrawer } from "@/components/stockdna/EvidenceDrawer";
import { RawLensDrawer } from "@/components/stockdna/RawLensDrawer";
import { LoadingSkeleton } from "@/components/stockdna/LoadingSkeleton";
import { ErrorBanner } from "@/components/stockdna/ErrorBanner";

export default function TickerKinPage() {
  const { query, loading, data, error, search } = useTickerKin("NVDA");

  const [activeEvidence, setActiveEvidence] = useState<EvidenceRecord | null>(null);
  const [isLensDrawerOpen, setIsLensDrawerOpen] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-app)",
        color: "var(--text-primary)",
        position: "relative",
      }}
    >
      {/* 1. Compact Application Header & Search Bar */}
      <SearchHeader
        onSearch={search}
        loading={loading}
        currentQuery={query}
        onOpenLensDrawer={() => setIsLensDrawerOpen(true)}
      />

      {/* 2. Main Exploration Area: The Kin Map */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          paddingTop: "0.5rem",
        }}
      >
        {loading && <LoadingSkeleton />}

        {!loading && error && (
          <ErrorBanner
            error={error}
            onReset={() => search("NVDA")}
          />
        )}

        {!loading && data && (
          <DnaGraph
            data={data}
            onInspectEvidence={(ev) => setActiveEvidence(ev)}
          />
        )}
      </div>

      {/* 3. Slide-Over Evidence Drawer */}
      <EvidenceDrawer
        evidence={activeEvidence}
        onClose={() => setActiveEvidence(null)}
      />

      {/* 4. Developer Raw Lens JSON Drawer */}
      <RawLensDrawer
        rawJson={data?.rawJson ?? null}
        query={data?.query ?? query}
        lookupType={data?.lookupType ?? "ticker"}
        isOpen={isLensDrawerOpen}
        onClose={() => setIsLensDrawerOpen(false)}
      />

      {/* 5. Minimal Application Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "1rem 1.25rem",
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "auto",
        }}
      >
        <p style={{ marginBottom: "0.2rem" }}>
          <strong style={{ color: "var(--text-secondary)" }}>TickerKin</strong> — Trace an equity across its verified tokenized representations
        </p>
        <p>
          BNB Hack: Tokenized Stocks Edition · Powered by <strong style={{ color: "var(--text-secondary)" }}>RWA Lens Engine</strong>
        </p>
      </footer>
    </main>
  );
}
