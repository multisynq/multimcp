
import { Page, expect } from '@playwright/test';
import { TEST_ENDPOINTS, TestHelpers } from '../fixtures';

export class EndpointPage {
  constructor(public readonly page: Page) {}

  async testSSEEndpoint() {
    const response = await this.page.request.get(TEST_ENDPOINTS.SSE);
    return {
      ok: response.ok(),
      status: response.status(),
      headers: response.headers(),
    };
  }

  async testMCPEndpoint() {
    const response = await this.page.request.post(TEST_ENDPOINTS.MCP, {
      data: TestHelpers.generateMCPRequest('tools/list'),
      headers: { 'Content-Type': 'application/json' },
    });
    return {
      ok: response.ok(),
      status: response.status(),
      body: await response.json(),
    };
  }

  async testOpenAPIEndpoint() {
    const response = await this.page.request.get(TEST_ENDPOINTS.OPENAPI);
    return {
      ok: response.ok(),
      status: response.status(),
    };
  }

  async testOpenAPISchema() {
    const response = await this.page.request.get(TEST_ENDPOINTS.OPENAPI);
    const body = await response.json();
    return {
      ok: response.ok(),
      status: response.status(),
      body,
      isValidOpenAPI: body.openapi !== undefined,
    };
  }

  async testCORSHeaders() {
    const response = await this.page.request.get(TEST_ENDPOINTS.SSE, {
      headers: { Origin: 'https://example.com' },
    });
    const headers = response.headers();
    return {
      hasCORS: headers['access-control-allow-origin'] !== undefined,
      allowsOrigin: headers['access-control-allow-origin'] === '*',
    };
  }

  async measureResponseTime(endpoint, method = 'GET', data = null) {
    const start = performance.now();
    const response = await this.page.request[method.toLowerCase()](endpoint, { data });
    const duration = performance.now() - start;
    return {
      ok: response.ok(),
      responseTime: duration,
    };
  }

  async testHealthEndpoint() {
    const response = await this.page.request.get(TEST_ENDPOINTS.HEALTH);
    const body = await response.json();
    return {
      ok: response.ok(),
      isHealthy: body.status === 'ok',
      body,
    };
  }

  async testRootEndpointsList() {
    const response = await this.page.request.get('/');
    const body = await response.text();
    return {
      ok: response.ok(),
      hasMultiSynqEndpoint: body.includes('MultiSynq'),
    };
  }
}
