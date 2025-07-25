import { ServerParameters } from "@repo/zod-types";

export const MULTISYNQ_MCP_CONFIG: ServerParameters = {
  type: "STDIO" as const,
  command: "npx",
  args: ["@context7/mcp-server"],
  env: {
    // Pre-configure with MultiSynq library ID to avoid resolution step
    CONTEXT7_LIBRARY_ID: "/multisynq/docs",
    CONTEXT7_API_KEY: process.env.CONTEXT7_API_KEY || ""
  }
};

export const MULTISYNQ_SERVER_CONFIG = {
  name: "MultiSynq-Docs",
  description: "MultiSynq Documentation and API Reference via Context7",
  config: MULTISYNQ_MCP_CONFIG,
  isSystem: true
};

export const MULTISYNQ_NAMESPACE_CONFIG = {
  name: "multisynq",
  description: "MultiSynq Documentation and API Reference",
  isSystem: true
};

export const MULTISYNQ_ENDPOINT_CONFIG = {
  name: "multisynq",
  description: "Public endpoint for MultiSynq documentation and API access",
  authLevel: "PUBLIC" as const, // No auth required
  isSystem: true
};
