import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Phase 8C.1: Sidebar Navigation Fix Tests", () => {
  it("1. verifies all navigation routes are defined as Next.js Links in Sidebar.tsx", () => {
    const filePath = resolve(process.cwd(), "src/components/layout/Sidebar.tsx");
    const content = readFileSync(filePath, "utf-8");

    // EXPLORE section
    expect(content).toContain('href="/"');
    expect(content).toContain('href="/equities"');
    expect(content).toContain('href="/providers"');

    // INTELLIGENCE section (with Overview)
    expect(content).toContain("href={basePath}");
    expect(content).toContain("href={`${basePath}/kin`}");
    expect(content).toContain("href={`${basePath}/compare`}");
    expect(content).toContain("href={`${basePath}/evidence`}");

    // DEVELOPERS section
    expect(content).toContain('href="/developers/api"');
  });

  it("2. verifies exact route matching logic prevents '/' from leaking active status", () => {
    const filePath = resolve(process.cwd(), "src/components/layout/Sidebar.tsx");
    const content = readFileSync(filePath, "utf-8");

    // Exact route comparison
    expect(content).toContain('const isExploreOverview = normalizedPath === "/"');
    expect(content).toContain('const isEquities = normalizedPath === "/equities"');
    expect(content).toContain('const isProviders = normalizedPath === "/providers"');
    expect(content).toContain("const isIntelligenceOverview =");
    expect(content).toContain("normalizedPath.toUpperCase() === basePath.toUpperCase()");
  });

  it("3. verifies unit logic for active route determination across all pages", () => {
    const getActiveState = (pathname: string, activeTicker = "NVDA") => {
      const normalizedPath = pathname.replace(/\/+$/, "") || "/";
      const tickerUpper = activeTicker.toUpperCase();
      const basePath = `/equity/${tickerUpper}`;

      return {
        isExploreOverview: normalizedPath === "/",
        isEquities: normalizedPath === "/equities",
        isProviders: normalizedPath === "/providers",
        isIntelligenceOverview: normalizedPath.toUpperCase() === basePath.toUpperCase(),
        isKinMap: normalizedPath.toUpperCase() === `${basePath}/kin`.toUpperCase(),
        isCompare: normalizedPath.toUpperCase() === `${basePath}/compare`.toUpperCase(),
        isEvidence: normalizedPath.toUpperCase() === `${basePath}/evidence`.toUpperCase(),
        isApi: normalizedPath === "/developers/api" || normalizedPath.startsWith("/developers"),
      };
    };

    // On "/" (Home)
    const homeState = getActiveState("/");
    expect(homeState.isExploreOverview).toBe(true);
    expect(homeState.isEquities).toBe(false);
    expect(homeState.isProviders).toBe(false);
    expect(homeState.isIntelligenceOverview).toBe(false);
    expect(homeState.isKinMap).toBe(false);
    expect(homeState.isCompare).toBe(false);
    expect(homeState.isEvidence).toBe(false);
    expect(homeState.isApi).toBe(false);

    // On "/equities"
    const equitiesState = getActiveState("/equities");
    expect(equitiesState.isExploreOverview).toBe(false);
    expect(equitiesState.isEquities).toBe(true);
    expect(equitiesState.isIntelligenceOverview).toBe(false);

    // On "/equity/NVDA" (NVDA Overview)
    const nvdaOverviewState = getActiveState("/equity/NVDA");
    expect(nvdaOverviewState.isExploreOverview).toBe(false);
    expect(nvdaOverviewState.isEquities).toBe(false);
    expect(nvdaOverviewState.isIntelligenceOverview).toBe(true);
    expect(nvdaOverviewState.isKinMap).toBe(false);
    expect(nvdaOverviewState.isCompare).toBe(false);
    expect(nvdaOverviewState.isEvidence).toBe(false);

    // On "/equity/NVDA/kin"
    const kinState = getActiveState("/equity/NVDA/kin");
    expect(kinState.isExploreOverview).toBe(false);
    expect(kinState.isIntelligenceOverview).toBe(false);
    expect(kinState.isKinMap).toBe(true);
    expect(kinState.isCompare).toBe(false);

    // On "/equity/NVDA/compare"
    const compareState = getActiveState("/equity/NVDA/compare");
    expect(compareState.isExploreOverview).toBe(false);
    expect(compareState.isCompare).toBe(true);
    expect(compareState.isKinMap).toBe(false);

    // On "/equity/NVDA/evidence"
    const evidenceState = getActiveState("/equity/NVDA/evidence");
    expect(evidenceState.isExploreOverview).toBe(false);
    expect(evidenceState.isEvidence).toBe(true);
    expect(evidenceState.isCompare).toBe(false);

    // On "/developers/api"
    const apiState = getActiveState("/developers/api");
    expect(apiState.isExploreOverview).toBe(false);
    expect(apiState.isApi).toBe(true);
  });

  it("4. verifies CSS classes for hover, active, and keyboard focus states exist in globals.css", () => {
    const filePath = resolve(process.cwd(), "src/app/globals.css");
    const content = readFileSync(filePath, "utf-8");

    expect(content).toContain(".sidebar-nav-link");
    expect(content).toContain(".sidebar-nav-link:hover:not(.active)");
    expect(content).toContain(".sidebar-nav-link.active");
    expect(content).toContain(".sidebar-nav-link.active:hover");
    expect(content).toContain(".sidebar-nav-link:focus-visible");
    expect(content).toContain("outline: 2px solid var(--accent-primary)");
    expect(content).toContain("--bg-secondary: #f1f4f8;");
    expect(content).toContain(".desktop-sidebar-container");
  });

  it("5. verifies no <style jsx> blocks exist in layout and app shell components", () => {
    const appShellPath = resolve(process.cwd(), "src/components/layout/AppShell.tsx");
    const appShellContent = readFileSync(appShellPath, "utf-8");
    expect(appShellContent).not.toContain("<style jsx");

    const layoutPath = resolve(process.cwd(), "src/app/layout.tsx");
    const layoutContent = readFileSync(layoutPath, "utf-8");
    expect(layoutContent).not.toContain("<style jsx");
  });

  it("6. verifies truthful API documentation copy without regulatory/cryptographic overclaims", () => {
    const apiPagePath = resolve(process.cwd(), "src/app/developers/api/page.tsx");
    const apiPageContent = readFileSync(apiPagePath, "utf-8");

    // Must contain truthful provenance copy
    expect(apiPageContent).toContain("Verification & Provenance Evidence");
    expect(apiPageContent).toContain("Claim-scoped evidence from verified on-chain data");

    // Must NOT contain overclaiming copy
    expect(apiPageContent).not.toContain("Cryptographic & Regulatory Evidence");
    expect(apiPageContent).not.toContain("Retrieve claim-scoped audit trails");
  });
});

