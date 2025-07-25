# MultiSynq MCP Integration

This directory contains the MultiSynq MCP integration that automatically creates a public endpoint for MultiSynq documentation via Context7.

## What it does

When MetaMCP starts up, it automatically:

1. **Creates a MultiSynq MCP Server** that uses Context7 to serve MultiSynq documentation
2. **Creates a "multisynq" namespace** containing that server  
3. **Creates a public "multisynq" endpoint** with no authentication required

## Endpoints Created

Once initialized, the following endpoints are available:

- **SSE**: `/metamcp/multisynq/sse`
- **HTTP**: `/metamcp/multisynq/mcp` 
- **OpenAPI**: `/metamcp/multisynq/openapi`

## Setup

1. **Get a Context7 API Key**: Sign up at [context7.io](https://context7.io) and get your API key

2. **Add to Environment**: Add your Context7 API key to your `.env` file:
   ```bash
   CONTEXT7_API_KEY=your_context7_api_key_here
   ```

3. **Deploy**: The MultiSynq endpoint will be automatically created on startup

## Usage Instructions for Developers

Add this to your `multisynq.io/vibe` page:

```markdown
## Educate AI Tools About MultiSynq

To help any AI assistant understand MultiSynq, simply add this MCP server:

**Public Endpoint**: `https://mcp.multisynq.io/metamcp/multisynq/sse`

### For Claude Desktop (via mcp-proxy):
```json
{
  "mcpServers": {
    "MultiSynq": {
      "command": "uvx",
      "args": ["mcp-proxy", "https://mcp.multisynq.io/metamcp/multisynq/sse"]
    }
  }
}
```

### For Cursor:
```json
{
  "mcpServers": {
    "MultiSynq": {
      "url": "https://mcp.multisynq.io/metamcp/multisynq/sse"
    }
  }
}
```

No Context7 setup needed - just add the URL and start building!
```

## Files

- `config.ts` - Configuration for the MultiSynq MCP server, namespace, and endpoint
- `init.ts` - Initialization logic that creates the MultiSynq integration 
- `index.ts` - Module exports

## Benefits

- **Zero friction**: Developers get one URL that works immediately
- **No Context7 setup**: MetaMCP handles the Context7 integration internally  
- **Always up-to-date**: Pulls from your latest docs automatically
- **Universal compatibility**: Works with any MCP-compatible AI tool
- **Professional endpoint**: `mcp.multisynq.io` looks official and trustworthy
