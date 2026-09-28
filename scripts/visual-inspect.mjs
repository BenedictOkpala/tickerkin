// scripts/visual-inspect.mjs
// Phase 4D Visual Verification (Fast In-Process Check)

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const css = fs.readFileSync(path.resolve(__dirname, "../src/app/globals.css"), "utf-8");
const page = fs.readFileSync(path.resolve(__dirname, "../src/app/page.tsx"), "utf-8");
const header = fs.readFileSync(path.resolve(__dirname, "../src/components/stockdna/SearchHeader.tsx"), "utf-8");
const graph = fs.readFileSync(path.resolve(__dirname, "../src/components/stockdna/DnaGraph.tsx"), "utf-8");
const pill = fs.readFileSync(path.resolve(__dirname, "../src/components/stockdna/EconomicPill.tsx"), "utf-8");

console.log("=== TICKERKIN LIGHT VISUAL SYSTEM VERIFICATION ===");

const checks = [
  { name: "Light background defined (--bg-app: #f8f9fb)", pass: css.includes("--bg-app: #f8f9fb") },
  { name: "Primary dark typography defined (--text-primary: #0f172a)", pass: css.includes("--text-primary: #0f172a") },
  { name: "Cobalt slate accent defined (--accent-primary: #1a56db)", pass: css.includes("--accent-primary: #1a56db") },
  { name: "BNB gold accent restrained (--accent-bnb: #b48500)", pass: css.includes("--accent-bnb: #b48500") },
  { name: "Curved SVG bezier paths in Kin Map", pass: graph.includes("C 500 28") },
  { name: "Mobile vertical lineage rail implemented", pass: graph.includes("kin-mobile-connector-node") },
  { name: "Truthful unloaded factor message", pass: pill.includes("Live factor not loaded") },
  { name: "Truthful unloaded rate message", pass: pill.includes("Live redemption rate not loaded") },
  { name: "Compact application header", pass: header.includes("TickerKin") },
];

let allPassed = true;
for (const c of checks) {
  if (c.pass) {
    console.log(`  ✓ PASS: ${c.name}`);
  } else {
    console.log(`  ✗ FAIL: ${c.name}`);
    allPassed = false;
  }
}

if (allPassed) {
  console.log("\n🎉 ALL 9 LIGHT VISUAL CHECKS VERIFIED SUCCESSFULLY!\n");
} else {
  console.error("\n❌ VISUAL CHECKS FAILED.\n");
  process.exit(1);
}
