# MultiSynq MCP Integration

This directory contains the MultiSynq MCP integration that automatically creates a **root endpoint** for MultiSynq documentation via Context7.

## What it does

When MetaMCP starts up, it automatically:

1. **Creates a MultiSynq MCP Server** that uses Context7 to serve MultiSynq documentation
2. **Creates a "root" namespace** containing that server  
3. **Creates a public "root" endpoint** with no authentication required

## Endpoints Created

Once initialized, the following endpoints are available **at the root**:

- **SSE**: `/sse`
- **HTTP**: `/mcp` 
- **OpenAPI**: `/api`

## Setup

1. **Install Context7 MCP Server**: The Dockerfile automatically installs `@context7/mcp-server`

2. **Deploy**: The MultiSynq root endpoint will be automatically created on startup

## Usage Instructions for Developers

Add this to your `multisynq.io/vibe` page:

```markdown
## Educate AI Tools About MultiSynq

To help any AI assistant understand MultiSynq, simply add this MCP server:

**Public Endpoint**: `https://mcp.multisynq.io/`

### For Claude Desktop (via mcp-proxy):
```json
{
  "mcpServers": {
    "MultiSynq": {
      "command": "uvx",
      "args": ["mcp-proxy", "https://mcp.multisynq.io/sse"]
    }
  }
}
```

### For Cursor:
```json
{
  "mcpServers": {
    "MultiSynq": {
      "url": "https://mcp.multisynq.io/sse"
    }
  }
}
```

No Context7 setup needed - just add the URL and start building!
```

## Testing

Run the test suite:

```bash
# Run all MultiSynq tests
npm run test:multisynq

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## Inspector Integration

The MultiSynq integration automatically configures the MCP Inspector with:

- Pre-configured server settings for debugging
- Automatic endpoint detection for testing
- Diagnostic information for troubleshooting
- Ready-to-use tool testing interface

## Files

- `config.ts` - Configuration for the MultiSynq MCP server, namespace, and endpoint
- `init.ts` - Initialization logic that creates the MultiSynq integration 
- `index.ts` - Module exports
- `__tests__/` - Comprehensive test suite
  - `config.test.ts` - Configuration validation tests
  - `init.test.ts` - Initialization logic tests
  - `integration.test.ts` - End-to-end integration tests
  - `inspector.test.ts` - Inspector integration tests
  - `setup.ts` - Test environment setup

## Benefits

- **Zero friction**: Developers get one URL that works immediately
- **No Context7 setup**: MetaMCP handles the Context7 integration internally  
- **Always up-to-date**: Pulls from your latest docs automatically
- **Universal compatibility**: Works with any MCP-compatible AI tool
- **Professional endpoint**: `mcp.multisynq.io` looks official and trustworthy
- **Root access**: Simple `/sse`, `/mcp`, `/api` endpoints (no nested paths)
- **Robust testing**: Comprehensive test suite ensures reliability
- **Inspector ready**: Built-in debugging and inspection capabilities
