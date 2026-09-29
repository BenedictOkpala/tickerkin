import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  handleResolveEquity,
  handleResolveContract,
  handleCompareRepresentations,
  handleGetEvidence,
  handleListEquities,
} from "./tools";

export function createRwaLensMcpServer(): McpServer {
  const server = new McpServer({
    name: "rwa-lens",
    version: "1.0.0",
  });

  // Tool 1: resolve_equity
  server.tool(
    "resolve_equity",
    "Use when an agent knows a traditional stock ticker and needs to discover its verified tokenized representations, providers, and economic mechanics on BNB Smart Chain.",
    {
      ticker: z
        .string()
        .min(1)
        .describe("Underlying stock ticker symbol (e.g. 'NVDA', 'AAPL', 'TSLA')"),
    },
    async ({ ticker }) => {
      const result = await handleResolveEquity({ ticker });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 2: resolve_contract
  server.tool(
    "resolve_contract",
    "Use when an agent encounters a BSC token contract address and needs to determine which traditional equity and tokenization provider it represents.",
    {
      contractAddress: z
        .string()
        .min(10)
        .describe("BEP-20 smart contract address on BNB Smart Chain (0x... hex string)"),
    },
    async ({ contractAddress }) => {
      const result = await handleResolveContract({ contractAddress });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 3: compare_representations
  server.tool(
    "compare_representations",
    "Use when an agent needs to understand how multiple tokenized representations of the same equity differ in economic models (Auto-DRIP vs Multiplier vs Redemption Rate), dividend handling, and verification.",
    {
      ticker: z
        .string()
        .min(1)
        .describe("Underlying stock ticker symbol (e.g. 'NVDA')"),
    },
    async ({ ticker }) => {
      const result = await handleCompareRepresentations({ ticker });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 4: get_evidence
  server.tool(
    "get_evidence",
    "Use when an agent needs the canonical evidence and provenance audit trail supporting an RWA Lens identity, smart contract, or economic mechanism claim.",
    {
      ticker: z
        .string()
        .min(1)
        .describe("Underlying stock ticker symbol (e.g. 'NVDA')"),
      providerId: z
        .string()
        .optional()
        .describe("Optional provider ID filter ('ondo', 'bstocks', or 'xstocks')"),
    },
    async ({ ticker, providerId }) => {
      const result = await handleGetEvidence({ ticker, providerId });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Tool 5: list_equities
  server.tool(
    "list_equities",
    "Use when an agent needs to list all traditional equities currently indexed and verified with tokenized representations in RWA Lens on BNB Smart Chain.",
    {},
    async () => {
      const result = await handleListEquities();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  return server;
}

export async function runStdioServer() {
  const server = createRwaLensMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log message to stderr so stdout remains clean for MCP JSON-RPC
  console.error("RWA Lens MCP Server running on stdio");
}
