"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  readonly children: ReactNode;
  readonly activeTicker?: string;
  readonly currentQuery?: string;
}

export function AppShell({ children, activeTicker = "NVDA", currentQuery = "" }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--bg-app)",
        color: "var(--text-primary)",
      }}
    >
      {/* 1. Desktop Persistent Sidebar */}
      <div className="desktop-sidebar-container">
        <Sidebar activeTicker={activeTicker} />
      </div>

      {/* 2. Mobile Slide-Over Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{ width: "260px", height: "100%", backgroundColor: "var(--bg-surface)" }}
            onClick={(e) => e.stopPropagation()}
            className="animate-slide-in"
          >
            <Sidebar activeTicker={activeTicker} onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Main Product Workspace */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        <TopBar
          onToggleMobileSidebar={() => setMobileMenuOpen((prev) => !prev)}
          currentQuery={currentQuery}
        />

        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </main>

        {/* Minimal Persistent Footer */}
        <footer
          style={{
            padding: "1.25rem 2rem",
            fontSize: "0.76rem",
            color: "var(--text-muted)",
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div>
            <strong style={{ color: "var(--text-secondary)" }}>TickerKin</strong> — Tokenized equity intelligence across BNB Smart Chain.
          </div>
          <div>
            Powered by <strong style={{ color: "var(--text-secondary)" }}>RWA Lens Engine</strong> · Curated On-Chain Registry
          </div>
        </footer>
      </div>

      <style jsx global>{`
        .desktop-sidebar-container {
          display: block;
          flex-shrink: 0;
          width: 240px;
        }

        @media (max-width: 880px) {
          .desktop-sidebar-container {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
