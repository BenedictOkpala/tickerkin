import { spawn } from "child_process";

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runSmokeTest() {
  console.log("Starting Next.js server on port 3005...");
  const server = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", "3005"], {
    stdio: "pipe",
    cwd: process.cwd(),
  });

  let serverStarted = false;
  server.stdout.on("data", (data) => {
    const text = data.toString();
    if (text.includes("Ready") || text.includes("started server on") || text.includes("http://localhost:3005")) {
      serverStarted = true;
    }
  });

  // Wait up to 10 seconds for server to be ready
  for (let i = 0; i < 20; i++) {
    if (serverStarted) break;
    await wait(500);
  }

  const endpoints = [
    { name: "Root Discovery", url: "http://localhost:3005/api/lens" },
    { name: "NVDA Ticker", url: "http://localhost:3005/api/lens/ticker/NVDA" },
    { name: "nvda (lowercase)", url: "http://localhost:3005/api/lens/ticker/nvda" },
    { name: "Unsupported Ticker", url: "http://localhost:3005/api/lens/ticker/DOESNOTEXIST" },
    { name: "Ondo NVDA Contract", url: "http://localhost:3005/api/lens/contract/0xa9ee28c80f960b889dfbd1902055218cba016f75" },
    { name: "Malformed Contract", url: "http://localhost:3005/api/lens/contract/malformed-addr-xyz" },
  ];

  console.log("\n=================== SMOKE TEST RESULTS ===================");
  const results = [];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url);
      const json = await res.json();
      results.push({
        endpoint: ep.name,
        url: ep.url,
        status: res.status,
        ok: json.ok,
        payloadSummary: json.ok
          ? (json.data.service || `Underlying: ${json.data.underlying.ticker}, Reps: ${json.data.representations?.length ?? 1}`)
          : `Error: ${json.error.code} (${json.error.message})`,
      });
    } catch (err) {
      results.push({
        endpoint: ep.name,
        url: ep.url,
        status: "ERR",
        ok: false,
        payloadSummary: String(err),
      });
    }
  }

  console.table(results);
  console.log("==========================================================\n");

  server.kill();
  process.exit(0);
}

runSmokeTest();
