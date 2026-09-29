import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { lookupByTicker } from "@/lens";
import { WorkspaceHeader } from "@/components/equity/WorkspaceHeader";

interface EquityLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{
    ticker: string;
  }>;
}

export default async function EquityLayout({ children, params }: EquityLayoutProps) {
  const { ticker } = await params;
  const result = lookupByTicker(ticker);

  if (!result.success) {
    notFound();
  }

  const { underlying, representations } = result;

  return (
    <AppShell activeTicker={underlying.ticker}>
      <div
        style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "1.5rem 2rem 3rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {/* Persistent Underlying Equity Workspace Header */}
        <WorkspaceHeader
          underlying={underlying}
          representationCount={representations.length}
        />

        {/* Tab Sub-Page Content */}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </AppShell>
  );
}
