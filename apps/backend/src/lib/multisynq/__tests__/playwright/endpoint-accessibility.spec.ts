import { test, expect, TestHelpers, TEST_ENDPOINTS, TEST_TIMEOUTS } from '../fixtures';

test.describe('MultiSynq MCP Endpoint Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure server is ready before each test
    await TestHelpers.waitForServer(page, TEST_TIMEOUTS.SERVER_START);
  });

  test.describe('Root Endpoint Accessibility', () => {
    test('should access SSE endpoint at root', async ({ endpointPage }) => {
      const result = await endpointPage.testSSEEndpoint();
      
      expect(result.ok).toBeTruthy();
      expect(result.status).toBe(200);
      expect(result.headers['content-type']).toContain('text/event-stream');
    });

    test('should access MCP endpoint at root', async ({ endpointPage }) => {
      const result = await endpointPage.testMCPEndpoint();
      
      expect(result.ok).toBeTruthy();
      expect(result.status).toBe(200);
      expect(result.body).toBeTruthy();
    });

    test('should access OpenAPI endpoint at root', async ({ endpointPage }) => {
      const result = await endpointPage.testOpenAPIEndpoint();
      
      expect(result.ok).toBeTruthy();
      expect(result.status).toBe(200);
    });

    test('should provide valid OpenAPI schema', async ({ endpointPage }) => {
      const result = await endpointPage.testOpenAPISchema();
      
      expect(result.ok).toBeTruthy();
      expect(result.status).toBe(200);
      expect(result.isValidOpenAPI).toBeTruthy();
      expect(result.body.info.title).toContain('MultiSynq');
    });
  });

  test.describe('CORS and Headers', () => {
    test('should support CORS for cross-origin requests', async ({ endpointPage }) => {
      const result = await endpointPage.testCORSHeaders();
      
      expect(result.hasCORS).toBeTruthy();
      expect(result.allowsOrigin).toBeTruthy();
    });

    test('should have appropriate security headers', async ({ page }) => {
      const response = await page.request.get(TEST_ENDPOINTS.SSE);
      const headers = response.headers();
      
      // Check for security headers (may vary based on MetaMCP config)
      expect(headers['x-content-type-options']).toBeDefined();
    });
  });

  test.describe('Public Access', () => {
    test('should not require authentication for SSE endpoint', async ({ page }) => {
      const response = await page.request.get(TEST_ENDPOINTS.SSE);
      
      // Should not get 401 Unauthorized
      expect(response.status()).not.toBe(401);
      expect(response.status()).not.toBe(403);
    });

    test('should not require authentication for MCP endpoint', async ({ page }) => {
      const response = await page.request.post(TEST_ENDPOINTS.MCP, {
        data: TestHelpers.generateMCPRequest('tools/list'),
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Should not get 401 Unauthorized
      expect(response.status()).not.toBe(401);
      expect(response.status()).not.toBe(403);
    });
  });

  test.describe('Performance', () => {
    test('SSE endpoint should respond within 500ms', async ({ endpointPage }) => {
      const result = await endpointPage.measureResponseTime(TEST_ENDPOINTS.SSE);
      
      expect(result.ok).toBeTruthy();
      expect(result.responseTime).toBeLessThan(500);
    });

    test('MCP endpoint should respond within 1000ms', async ({ endpointPage }) => {
      const result = await endpointPage.measureResponseTime(
        TEST_ENDPOINTS.MCP, 
        'POST', 
        TestHelpers.generateMCPRequest('tools/list')
      );
      
      expect(result.ok).toBeTruthy();
      expect(result.responseTime).toBeLessThan(1000);
    });
  });

  test.describe('Health Monitoring', () => {
    test('should provide health endpoint', async ({ endpointPage }) => {
      const result = await endpointPage.testHealthEndpoint();
      
      expect(result.ok).toBeTruthy();
      expect(result.isHealthy).toBeTruthy();
      expect(result.body.status).toBe('ok');
    });

    test('should list MultiSynq endpoint in root list', async ({ endpointPage }) => {
      const result = await endpointPage.testRootEndpointsList();
      
      expect(result.ok).toBeTruthy();
      expect(result.hasMultiSynqEndpoint).toBeTruthy();
    });
  });
});
