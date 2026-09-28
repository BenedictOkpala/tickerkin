"use client";

import { useState } from "react";
import { useStockDna } from "@/hooks/useStockDna";
import type { EvidenceRecord } from "@/types/provenance";
import { SearchHeader } from "@/components/stockdna/SearchHeader";
import { DnaGraph } from "@/components/stockdna/DnaGraph";
import { EvidenceDrawer } from "@/components/stockdna/EvidenceDrawer";
import { RawLensDrawer } from "@/components/stockdna/RawLensDrawer";
import { LoadingSkeleton } from "@/components/stockdna/LoadingSkeleton";
import { ErrorBanner } from "@/components/stockdna/ErrorBanner";

export default function StockDnaPage() {
  const { query, loading, data, error, search } = useStockDna("NVDA");

  const [activeEvidence, setActiveEvidence] = useState<EvidenceRecord | null>(null);
  const [isLensDrawerOpen, setIsLensDrawerOpen] = useState(false);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        position: "relative",
      }}
    >
      {/* 1. Header & Search Bar */}
      <SearchHeader
        onSearch={search}
        loading={loading}
        currentQuery={query}
      />

      {/* 2. Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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

      {/* 3. Floating Developer Control Bar (View Lens Data) */}
      {data && (
        <div
          style={{
            position: "fixed",
            bottom: "1.25rem",
            right: "1.25rem",
            zIndex: 50,
          }}
        >
          <button
            type="button"
            onClick={() => setIsLensDrawerOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.1rem",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--accent-gold-border)",
              color: "var(--accent-gold)",
              fontWeight: 600,
              fontSize: "0.85rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
              transition: "transform 0.15s, background-color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-surface)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-card)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>{`{ }`}</span>
            <span>View Lens Data</span>
          </button>
        </div>
      )}

      {/* 4. Evidence Drawer */}
      <EvidenceDrawer
        evidence={activeEvidence}
        onClose={() => setActiveEvidence(null)}
      />

      {/* 5. Raw Lens JSON Drawer */}
      <RawLensDrawer
        rawJson={data?.rawJson ?? null}
        query={data?.query ?? query}
        lookupType={data?.lookupType ?? "ticker"}
        isOpen={isLensDrawerOpen}
        onClose={() => setIsLensDrawerOpen(false)}
      />

      {/* 6. Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "1.5rem 1rem",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-subtle)",
          marginTop: "auto",
        }}
      >
        <p style={{ marginBottom: "0.3rem" }}>
          <strong>StockDNA</strong> • Discovery & Normalization Interface for Tokenized Stocks
        </p>
        <p>
          Built for <strong>BNB Hack: Tokenized Stocks Edition</strong> • Powered by <strong>RWA Lens Engine</strong>
        </p>
      </footer>
    </main>
  );
}
