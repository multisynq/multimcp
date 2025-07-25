import { Page, Locator, expect } from '@playwright/test';

export class EndpointPage {
  readonly page: Page;
  readonly baseURL: string;

  constructor(page: Page, baseURL: string = 'http://localhost:12008') {
    this.page = page;
    this.baseURL = baseURL;
  }

  async testSSEEndpoint() {
    const response = await this.page.request.get('/sse');
    return {
      status: response.status(),
      headers: response.headers(),
      ok: response.ok()
    };
  }

  async testMCPEndpoint() {
    const response = await this.page.request.post('/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      status: response.status(),
      body: await response.json().catch(() => null),
      ok: response.ok()
    };
  }

  async testOpenAPIEndpoint() {
    const response = await this.page.request.get('/api');
    return {
      status: response.status(),
      headers: response.headers(),
      ok: response.ok()
    };
  }

  async testOpenAPISchema() {
    const response = await this.page.request.get('/api/openapi.json');
    const body = await response.json().catch(() => null);
    
    return {
      status: response.status(),
      body,
      ok: response.ok(),
      isValidOpenAPI: body && body.openapi && body.info
    };
  }

  async testHealthEndpoint() {
    const response = await this.page.request.get('/health');
    const body = await response.json().catch(() => null);
    
    return {
      status: response.status(),
      body,
      ok: response.ok(),
      isHealthy: body && body.status === 'ok'
    };
  }

  async testRootEndpointsList() {
    const response = await this.page.request.get('/');
    const body = await response.json().catch(() => null);
    
    return {
      status: response.status(),
      body,
      ok: response.ok(),
      hasMultiSynqEndpoint: body && body.endpoints && 
        body.endpoints.some((ep: any) => ep.name === 'root')
    };
  }

  async testCORSHeaders() {
    const response = await this.page.request.options('/sse', {
      headers: {
        'Origin': 'https://example.com',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    const headers = response.headers();
    return {
      status: response.status(),
      hasCORS: headers['access-control-allow-origin'] !== undefined,
      allowsOrigin: headers['access-control-allow-origin'],
      allowsMethods: headers['access-control-allow-methods']
    };
  }

  async testMCPProtocolCompliance() {
    // Test list tools
    const listToolsResponse = await this.page.request.post('/mcp', {
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const listToolsBody = await listToolsResponse.json().catch(() => null);
    
    // Test call tool (if tools are available)
    let callToolResponse = null;
    let callToolBody = null;
    
    if (listToolsBody && listToolsBody.result && listToolsBody.result.tools && listToolsBody.result.tools.length > 0) {
      const firstTool = listToolsBody.result.tools[0];
      
      callToolResponse = await this.page.request.post('/mcp', {
        data: {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: firstTool.name,
            arguments: {}
          }
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      callToolBody = await callToolResponse.json().catch(() => null);
    }

    return {
      listTools: {
        status: listToolsResponse.status(),
        body: listToolsBody,
        hasTools: listToolsBody && listToolsBody.result && listToolsBody.result.tools && listToolsBody.result.tools.length > 0
      },
      callTool: callToolResponse ? {
        status: callToolResponse.status(),
        body: callToolBody,
        successful: callToolBody && !callToolBody.error
      } : null
    };
  }

  async measureResponseTime(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const startTime = Date.now();
    
    let response;
    if (method === 'POST') {
      response = await this.page.request.post(endpoint, {
        data,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      response = await this.page.request.get(endpoint);
    }
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      responseTime,
      status: response.status(),
      ok: response.ok()
    };
  }
}
