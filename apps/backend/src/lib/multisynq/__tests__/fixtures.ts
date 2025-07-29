
import { test as baseTest, expect } from '@playwright/test';
import { EndpointPage } from './playwright/pages/endpoint-page';
import { InspectorPage } from './playwright/pages/inspector-page';

export const TEST_TIMEOUTS = {
  SERVER_START: 15000,
  PAGE_LOAD: 10000,
  API_RESPONSE: 5000,
};

export const TEST_ENDPOINTS = {
  SSE: '/sse',
  MCP: '/mcp',
  API: '/api',
  HEALTH: '/api/health',
  OPENAPI: '/api/openapi.json',
};

export const MCP_METHODS = {
  LIST_TOOLS: 'tools/list',
  CALL_TOOL: 'tools/call',
};

export const EXPECTED_TOOLS = [
  'resolve-library-id',
  'get-library-docs',
];

export const TestHelpers = {
  waitForServer: async (page, timeout) => {
    await page.waitForURL((url) => url.toString().includes('localhost'), { timeout });
  },
  generateMCPRequest: (method, params = {}) => ({
    jsonrpc: '2.0',
    id: `test-${Date.now()}`,
    method,
    params,
  }),
  verifyToolsListResponse: async (body) => {
    expect(body.result.tools).toBeInstanceOf(Array);
    return body.result.tools;
  },
  verifyToolCallResponse: async (body) => {
    expect(body.result).toBeDefined();
    return body.result;
  },
  measurePerformance: async (action) => {
    const start = performance.now();
    const result = await action();
    const duration = performance.now() - start;
    return { result, duration };
  },
};

const test = baseTest.extend({
  endpointPage: async ({ page }, use) => {
    await use(new EndpointPage(page));
  },
  inspectorPage: async ({ page }, use) => {
    await use(new InspectorPage(page));
  },
});

export { test, expect };
