import { test, expect, TestHelpers, MCP_METHODS, EXPECTED_TOOLS, TEST_TIMEOUTS } from '../fixtures';

test.describe('MCP Protocol Compliance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await TestHelpers.waitForServer(page, TEST_TIMEOUTS.SERVER_START);
  });

  test.describe('Tools Interface', () => {
    test('should list available tools', async ({ endpointPage }) => {
      const result = await endpointPage.testMCPProtocolCompliance();
      
      expect(result.listTools.hasTools).toBeTruthy();
      expect(result.listTools.body.result.tools).toBeInstanceOf(Array);
      expect(result.listTools.body.result.tools.length).toBeGreaterThan(0);
    });

    test('should include expected Context7 tools', async ({ page }) => {
      const response = await page.request.post('/mcp', {
        data: TestHelpers.generateMCPRequest(MCP_METHODS.LIST_TOOLS),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const body = await response.json();
      const tools = await TestHelpers.verifyToolsListResponse(body);
      
      const toolNames = tools.map((tool: any) => tool.name);
      
      // Check for expected Context7 tools
      expect(toolNames).toContain('resolve-library-id');
      expect(toolNames).toContain('get-library-docs');
    });

    test('should provide tool descriptions', async ({ page }) => {
      const response = await page.request.post('/mcp', {
        data: TestHelpers.generateMCPRequest(MCP_METHODS.LIST_TOOLS),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const body = await response.json();
      const tools = await TestHelpers.verifyToolsListResponse(body);
      
      // Each tool should have a description
      tools.forEach((tool: any) => {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(typeof tool.description).toBe('string');
      });
    });
  });

  test.describe('Tool Execution', () => {
    test('should execute get-library-docs tool', async ({ page }) => {
      // First get the tool to understand its parameters
      const listResponse = await page.request.post('/mcp', {
        data: TestHelpers.generateMCPRequest(MCP_METHODS.LIST_TOOLS),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const listBody = await listResponse.json();
      const tools = await TestHelpers.verifyToolsListResponse(listBody);
      
      const getDocsTool = tools.find((tool: any) => tool.name === 'get-library-docs');
      expect(getDocsTool).toBeTruthy();
      
      // Execute the tool with MultiSynq docs library ID
      const callResponse = await page.request.post('/mcp', {
        data: TestHelpers.generateMCPRequest(MCP_METHODS.CALL_TOOL, {
          name: 'get-library-docs',
          arguments: {
            context7CompatibleLibraryID: '/multisynq/docs'
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const callBody = await callResponse.json();
      const result = await TestHelpers.verifyToolCallResponse(callBody);
      
      expect(result).toBeTruthy();
      expect(result.content).toBeTruthy();
    });

    test('should handle invalid tool calls gracefully', async ({ page }) => {
      const response = await page.request.post('/mcp', {
        data: TestHelpers.generateMCPRequest(MCP_METHODS.CALL_TOOL, {
          name: 'nonexistent-tool',
          arguments: {}
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const body = await response.json();
      
      // Should return an error response, not crash
      expect(body.jsonrpc).toBe('2.0');
      expect(body.error).toBeTruthy();
      expect(body.error.code).toBeDefined();
      expect(body.error.message).toBeTruthy();
    });

    test('should handle malformed requests', async ({ page }) => {
      const response = await page.request.post('/mcp', {
        data: { invalid: 'request' },
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Should return proper error response
      expect(response.status()).toBe(400);
    });
  });

  test.describe('Context7 Integration', () => {
    test('should pre-configure MultiSynq library ID', async ({ page }) => {
      // The library should be pre-configured, so get-library-docs should work
      // without needing resolve-library-id first
      const response = await page.request.post('/mcp', {
        data: TestHelpers.generateMCPRequest(MCP_METHODS.CALL_TOOL, {
          name: 'get-library-docs',
          arguments: {
            context7CompatibleLibraryID: '/multisynq/docs'
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const body = await response.json();
      
      // Should succeed without requiring library resolution first
      expect(body.error).toBeFalsy();
      expect(body.result).toBeTruthy();
    });

    test('should return MultiSynq documentation content', async ({ page }) => {
      const response = await page.request.post('/mcp', {
        data: TestHelpers.generateMCPRequest(MCP_METHODS.CALL_TOOL, {
          name: 'get-library-docs',
          arguments: {
            context7CompatibleLibraryID: '/multisynq/docs',
            topic: 'getting-started'
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const body = await response.json();
      const result = await TestHelpers.verifyToolCallResponse(body);
      
      // Should contain MultiSynq-related content
      const content = result.content || result.text || '';
      expect(content.toLowerCase()).toContain('multisynq');
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should handle concurrent tool calls', async ({ page }) => {
      const promises = Array.from({ length: 5 }, () =>
        page.request.post('/mcp', {
          data: TestHelpers.generateMCPRequest(MCP_METHODS.LIST_TOOLS),
          headers: { 'Content-Type': 'application/json' }
        })
      );
      
      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
      });
    });

    test('should maintain performance under load', async ({ page }) => {
      const { result, duration } = await TestHelpers.measurePerformance(async () => {
        return await page.request.post('/mcp', {
          data: TestHelpers.generateMCPRequest(MCP_METHODS.LIST_TOOLS),
          headers: { 'Content-Type': 'application/json' }
        });
      });
      
      expect(result.ok()).toBeTruthy();
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
