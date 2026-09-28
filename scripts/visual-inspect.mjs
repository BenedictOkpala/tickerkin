// scripts/visual-inspect.mjs
// Phase 4C Visual & API Verification Smoke Test

import { spawn } from "node:child_process";
import http from "node:http";

const PORT = 3008;
const BASE_URL = `http://localhost:${PORT}`;

function fetchUrl(path) {
  return new Promise((resolve, reject) => {
    http
      .get(`${BASE_URL}${path}`, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      })
      .on("error", reject);
  });
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("=== STARTING TICKERKIN VISUAL & RUNTIME INSPECTION ===");

  const server = spawn("npm.cmd", ["run", "start", "--", "-p", String(PORT)], {
    shell: true,
    cwd: process.cwd(),
    stdio: "pipe",
  });

  server.stdout.on("data", (d) => {
    // console.log(`[Next.js stdout]: ${d}`);
  });
  server.stderr.on("data", (d) => {
    console.error(`[Next.js stderr]: ${d}`);
  });

  let ready = false;
  for (let i = 0; i < 25; i++) {
    await wait(500);
    try {
      const res = await fetchUrl("/");
      if (res.status === 200) {
        ready = true;
        break;
      }
    } catch {
      // Still booting
    }
  }

  if (!ready) {
    console.error("❌ Next.js production server failed to start within 12 seconds.");
    server.kill();
    process.exit(1);
  }

  console.log(`✓ Next.js production server running on port ${PORT}\n`);

  const assertions = [];

  try {
    // 1. Inspect Homepage HTML
    console.log("1. Inspecting Root UI & Brand Presentation (/)...");
    const home = await fetchUrl("/");
    assertions.push({
      test: "Home returns HTTP 200",
      pass: home.status === 200,
    });
    assertions.push({
      test: "Brand includes TickerKin",
      pass: home.body.includes("TickerKin"),
    });
    assertions.push({
      test: "Meta description reflects TickerKin and RWA Lens",
      pass: home.body.includes("Trace an equity across its verified tokenized representations"),
    });
    assertions.push({
      test: "No leftover StockDNA title",
      pass: !home.body.includes("<title>StockDNA"),
    });

    // 2. Inspect NVDA API
    console.log("2. Inspecting Flagship NVDA Lineage (/api/lens/ticker/NVDA)...");
    const nvdaRes = await fetchUrl("/api/lens/ticker/NVDA");
    const nvda = JSON.parse(nvdaRes.body);
    assertions.push({
      test: "NVDA returns 3 representations",
      pass: nvda.ok && nvda.data.representations.length === 3,
    });
    assertions.push({
      test: "NVDA has Ondo (NVDAon), bStocks (NVDAB), xStocks (NVDAx)",
      pass:
        nvda.data.representations.some((r) => r.tokenSymbol === "NVDAon") &&
        nvda.data.representations.some((r) => r.tokenSymbol === "NVDAB") &&
        nvda.data.representations.some((r) => r.tokenSymbol === "NVDAx"),
    });

    // 3. Inspect AAPL API
    console.log("3. Inspecting Narrow AAPL Lineage (/api/lens/ticker/AAPL)...");
    const aaplRes = await fetchUrl("/api/lens/ticker/AAPL");
    const aapl = JSON.parse(aaplRes.body);
    assertions.push({
      test: "AAPL accurately returns exactly 1 representation (Ondo AAPLon)",
      pass: aapl.ok && aapl.data.representations.length === 1 && aapl.data.representations[0].tokenSymbol === "AAPLon",
    });

    // 4. Inspect Contract Reverse Lookup
    console.log("4. Inspecting Contract Reverse Lookup (/api/lens/contract/0xa9ee28c80f960b889dfbd1902055218cba016f75)...");
    const contractRes = await fetchUrl("/api/lens/contract/0xa9ee28c80f960b889dfbd1902055218cba016f75");
    const contract = JSON.parse(contractRes.body);
    assertions.push({
      test: "Contract reverse lookup resolves to NVDA / NVDAon",
      pass: contract.ok && contract.data.underlying.ticker === "NVDA" && contract.data.matchedRepresentation.tokenSymbol === "NVDAon",
    });

    // 5. Inspect 404 & 400 Error Handlers
    console.log("5. Inspecting Error Handling (/api/lens/ticker/UNKNOWN and /api/lens/contract/0x123)...");
    const notFoundRes = await fetchUrl("/api/lens/ticker/UNKNOWN");
    const notFound = JSON.parse(notFoundRes.body);
    assertions.push({
      test: "Unknown ticker returns 404 TICKER_NOT_FOUND",
      pass: notFoundRes.status === 404 && notFound.error?.code === "TICKER_NOT_FOUND",
    });

    const invalidContractRes = await fetchUrl("/api/lens/contract/0x123");
    const invalidContract = JSON.parse(invalidContractRes.body);
    assertions.push({
      test: "Malformed address returns 400 INVALID_ADDRESS",
      pass: invalidContractRes.status === 400 && invalidContract.error?.code === "INVALID_ADDRESS",
    });

    // Print Summary
    console.log("\n=== INSPECTION RESULTS ===");
    let allPassed = true;
    for (const a of assertions) {
      if (a.pass) {
        console.log(`  ✓ PASS: ${a.test}`);
      } else {
        console.log(`  ✗ FAIL: ${a.test}`);
        allPassed = false;
      }
    }

    if (allPassed) {
      console.log("\n🎉 ALL 9 RUNTIME & BRAND CHECKS PASSED PERFECTLY!\n");
    } else {
      console.error("\n❌ SOME CHECKS FAILED.\n");
      process.exitCode = 1;
    }
  } finally {
    server.kill();
    // On Windows, kill child process tree
    spawn("taskkill", ["/pid", String(server.pid), "/f", "/t"], { shell: true });
  }
}

run();
