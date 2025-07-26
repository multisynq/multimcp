export const MULTISYNQ_MCP_CONFIG = {
  type: "STDIO" as const,
  command: "npx",
  args: ["@upstash/context7-mcp"],
  env: {
    // Pre-configure with MultiSynq library ID to avoid resolution step
    CONTEXT7_LIBRARY_ID: "/multisynq/docs",
  }
};

export const MULTISYNQ_SERVER_CONFIG = {
  name: "MultiSynq-Docs",
  description: "MultiSynq Documentation and API Reference via Context7",
  config: MULTISYNQ_MCP_CONFIG,
  isSystem: true
};

export const MULTISYNQ_NAMESPACE_CONFIG = {
  name: "root",
  description: "MultiSynq Documentation and API Reference - Root Endpoint",
  isSystem: true
};

export const MULTISYNQ_ENDPOINT_CONFIG = {
  name: "root", 
  description: "Root endpoint for MultiSynq documentation and API access",
  authLevel: "PUBLIC" as const, // No auth required
  isSystem: true
};
