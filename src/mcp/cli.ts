#!/usr/bin/env node
import { runStdioServer } from "./server";

runStdioServer().catch((error) => {
  console.error("Fatal error starting RWA Lens MCP Server:", error);
  process.exit(1);
});
