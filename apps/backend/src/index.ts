import express from "express";

import { auth } from "./auth";
import { initializeIdleServers } from "./lib/startup";
import { removeSensitiveHeaders, securityHeaders } from "./middleware/security-headers.middleware";
import mcpProxyRouter from "./routers/mcp-proxy";
import publicEndpointsRouter from "./routers/public-metamcp";
import trpcRouter from "./routers/trpc";

const app = express();

// Apply security headers to all routes
app.use(securityHeaders);
app.use(removeSensitiveHeaders);

// Global JSON middleware for non-proxy routes
app.use((req, res, next) => {
  if (req.path.startsWith("/mcp-proxy/") || req.path.startsWith("/metamcp/")) {
    // Skip JSON parsing for all MCP proxy routes and public endpoints to allow raw stream access
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Mount better-auth routes by calling auth API directly
app.use(async (req, res, next) => {
  if (req.path.startsWith("/api/auth")) {
    try {
      // Create a web Request object from Express request
      const url = new URL(req.url, `http://${req.headers.host}`);
      const headers = new Headers();

      // Copy headers from Express request
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) {
          headers.set(key, Array.isArray(value) ? value[0] : value);
        }
      });

      // Create Request object
      const request = new Request(url.toString(), {
        method: req.method,
        headers,
        body:
          req.method !== "GET" && req.method !== "HEAD"
            ? JSON.stringify(req.body)
            : undefined,
      });

      // Call better-auth directly
      const response = await auth.handler(request);

      // Convert Response back to Express response
      res.status(response.status);

      // Copy headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Send body
      const body = await response.text();
      res.send(body);
    } catch (error) {
      console.error("Auth route error:", error);
      res.status(500).json({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      });
    }
    return;
  }
  next();
});

// Mount public endpoints routes (must be before JSON middleware to handle raw streams)
app.use("/metamcp", publicEndpointsRouter);

// Mount MCP proxy routes
app.use("/mcp-proxy", mcpProxyRouter);

// Mount tRPC routes
app.use("/trpc", trpcRouter);

app.listen(12009, async () => {
  console.log(`Server is running on port 12009`);
  console.log(`Auth routes available at: http://localhost:12009/api/auth`);
  console.log(
    `Public MetaMCP endpoints available at: http://localhost:12009/metamcp`,
  );
  console.log(
    `MCP Proxy routes available at: http://localhost:12009/mcp-proxy`,
  );
  console.log(`tRPC routes available at: http://localhost:12009/trpc`);

  // Initialize idle servers after server starts
  await initializeIdleServers();
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    multisynq: {
      endpoint: "/sse",
      status: "ready"
    }
  });
});
