#!/usr/bin/env node

/**
 * Test script to simulate users asking questions about MultiSynq
 * This tests the public MCP endpoints without authentication
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  result: (msg) => console.log(`${colors.green}→ ${msg}${colors.reset}`),
};

// Test questions about MultiSynq
const testQuestions = [
  "What is MultiSynq?",
  "How do I create an activity in MultiSynq?",
  "What is timeline synchronization in MultiSynq?",
  "How does authentication work in MultiSynq?",
  "What are the core concepts of MultiSynq?",
];

async function testSSEEndpoint(baseUrl) {
  log.info(`Testing SSE endpoint at ${baseUrl}/sse`);
  
  try {
    const transport = new SSEClientTransport(`${baseUrl}/sse`);
    const client = new Client({ name: "multisynq-test-client", version: "1.0.0" }, { capabilities: {} });
    
    await client.connect(transport);
    log.success("Connected to SSE endpoint");
    
    // List available tools
    const tools = await client.listTools();
    log.success(`Available tools: ${tools.tools.map(t => t.name).join(', ')}`);
    
    // Test search functionality
    for (const question of testQuestions) {
      log.info(`Asking: "${question}"`);
      
      try {
        const result = await client.callTool({
          name: "search",
          arguments: { query: question }
        });
        
        if (result.content && result.content.length > 0) {
          const text = result.content[0].text;
          // Show first 200 characters of the response
          const preview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
          log.result(`Response preview: ${preview}`);
        } else {
          log.warning("No content in response");
        }
      } catch (error) {
        log.error(`Failed to get answer: ${error.message}`);
      }
      
      // Small delay between questions
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    await client.close();
    log.success("SSE test completed");
    
  } catch (error) {
    log.error(`SSE test failed: ${error.message}`);
    throw error;
  }
}

async function testHTTPEndpoint(baseUrl) {
  log.info(`Testing HTTP endpoint at ${baseUrl}/mcp`);
  
  try {
    const transport = new StreamableHTTPClientTransport(`${baseUrl}/mcp`);
    const client = new Client({ name: "multisynq-test-client", version: "1.0.0" }, { capabilities: {} });
    
    await client.connect(transport);
    log.success("Connected to HTTP endpoint");
    
    // Test with one question to verify it works
    const question = "What are the main features of MultiSynq?";
    log.info(`Asking: "${question}"`);
    
    const result = await client.callTool({
      name: "search",
      arguments: { query: question }
    });
    
    if (result.content && result.content.length > 0) {
      const text = result.content[0].text;
      const preview = text.substring(0, 200) + (text.length > 200 ? '...' : '');
      log.result(`Response preview: ${preview}`);
    }
    
    await client.close();
    log.success("HTTP test completed");
    
  } catch (error) {
    log.error(`HTTP test failed: ${error.message}`);
    throw error;
  }
}

async function testPublicAccess(baseUrl) {
  log.info(`Testing public access (no authentication) at ${baseUrl}`);
  
  try {
    // Test root info endpoint
    const response = await fetch(baseUrl);
    const data = await response.json();
    
    if (data.service === "MultiSynq MCP Server") {
      log.success("Root endpoint accessible without authentication");
      log.info(`Service: ${data.description}`);
    } else {
      log.error("Unexpected response from root endpoint");
    }
    
  } catch (error) {
    log.error(`Failed to access root endpoint: ${error.message}`);
  }
}

async function main() {
  console.log("=================================");
  console.log("MultiSynq MCP Usage Test");
  console.log("=================================\n");
  
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.BACKEND_PORT || 12009}`;
  log.info(`Using base URL: ${baseUrl}`);
  
  try {
    // Test public access
    await testPublicAccess(baseUrl);
    console.log();
    
    // Test SSE endpoint
    await testSSEEndpoint(baseUrl);
    console.log();
    
    // Test HTTP endpoint
    await testHTTPEndpoint(baseUrl);
    console.log();
    
    log.success("All tests completed successfully!");
    log.info("MultiSynq documentation is accessible without authentication");
    
  } catch (error) {
    log.error(`Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Run the tests
main().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
}); 