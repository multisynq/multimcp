import { test as base, expect } from '@playwright/test';
import { InspectorPage } from '../pages/InspectorPage';
import { EndpointPage } from '../pages/EndpointPage';

// Define custom fixtures
type TestFixtures = {
  inspectorPage: InspectorPage;
  endpointPage: EndpointPage;
};

export const test = base.extend<TestFixtures>({
  inspectorPage: async ({ page }, use) => {
    const inspectorPage = new InspectorPage(page);
    await use(inspectorPage);
  },

  endpointPage: async ({ page }, use) => {
    const endpointPage = new EndpointPage(page);
    await use(endpointPage);
  },
});

export { expect } from '@playwright/test';

// Common test utilities
export class TestHelpers {
  static async waitForServer(page: any, timeout = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const response = await page.request.get('/health');
        if (response.ok()) {
          return true;
        }
      } catch (error) {
        // Server not ready yet
      }
      
      await page.waitForTimeout(1000); // Wait 1 second before retry
    }
    
    throw new Error(`Server not ready after ${timeout}ms`);
  }

  static async verifyMCPResponse(response: any) {
    expect(response).toBeTruthy();
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBeDefined();
    
    if (response.error) {
      console.warn('MCP Error:', response.error);
    }
    
    return response;
  }

  static async verifyToolsListResponse(response: any) {
    this.verifyMCPResponse(response);
    expect(response.result).toBeDefined();
    expect(response.result.tools).toBeInstanceOf(Array);
    return response.result.tools;
  }

  static async verifyToolCallResponse(response: any) {
    this.verifyMCPResponse(response);
    expect(response.result).toBeDefined();
    return response.result;
  }

  static generateMCPRequest(method: string, params?: any, id: number = 1) {
    return {
      jsonrpc: '2.0',
      id,
      method,
      ...(params && { params })
    };
  }

  static async measurePerformance<T>(operation: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    const result = await operation();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { result, duration };
  }

  static async retryOperation<T>(
    operation: () => Promise<T>, 
    maxRetries: number = 3, 
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

// Test data constants
export const TEST_ENDPOINTS = {
  SSE: '/sse',
  MCP: '/mcp',
  API: '/api',
  OPENAPI_SCHEMA: '/api/openapi.json',
  HEALTH: '/health',
  ROOT: '/'
} as const;

export const MCP_METHODS = {
  LIST_TOOLS: 'tools/list',
  CALL_TOOL: 'tools/call',
  LIST_RESOURCES: 'resources/list',
  READ_RESOURCE: 'resources/read',
  LIST_PROMPTS: 'prompts/list',
  GET_PROMPT: 'prompts/get'
} as const;

export const EXPECTED_TOOLS = [
  'resolve-library-id',
  'get-library-docs'
] as const;

export const TEST_TIMEOUTS = {
  SERVER_START: 30000,
  API_RESPONSE: 10000,
  UI_INTERACTION: 5000,
  NETWORK_REQUEST: 15000
} as const;
