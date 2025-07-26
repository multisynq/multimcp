# Local Testing Guide for MultiSynq MCP Integration

This guide explains how to run and test the MultiSynq MCP integration locally.

## Prerequisites

- Node.js 18+ and pnpm installed
- Docker and Docker Compose installed
- Git repository cloned

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Start the application with Docker Compose:**
   ```bash
   # From the project root
   docker-compose up -d
   ```

2. **Wait for services to start:**
   ```bash
   # Check logs
   docker-compose logs -f app
   
   # Wait until you see:
   # "✅ MultiSynq root endpoint initialized successfully"
   ```

3. **Verify it's running:**
   ```bash
   # Health check
   curl http://localhost:12008/api/health
   
   # Should return:
   # {
   #   "status": "ok",
   #   "timestamp": "...",
   #   "multisynq": {
   #     "endpoint": "/sse",
   #     "status": "ready"
   #   }
   # }
   ```

### Option 2: Running Locally (Development)

1. **Install dependencies:**
   ```bash
   pnpm install
   pnpm build
   ```

2. **Start PostgreSQL:**
   ```bash
   # Start only the database
   docker-compose up -d postgres
   ```

3. **Set up environment variables:**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and ensure these are set:
   DATABASE_URL=postgresql://metamcp_user:m3t4mcp@localhost:9433/metamcp_db
   BETTER_AUTH_SECRET=your-local-dev-secret-key
   APP_URL=http://localhost:12008
   NEXT_PUBLIC_APP_URL=http://localhost:12008
   ```

4. **Run database migrations:**
   ```bash
   cd apps/backend
   pnpm db:push
   ```

5. **Start the backend:**
   ```bash
   # In apps/backend
   pnpm dev
   ```

6. **Start the frontend (in a new terminal):**
   ```bash
   # In apps/frontend
   pnpm dev
   ```

## Testing MultiSynq Integration

### 1. Test Public Endpoints

```bash
# Test SSE endpoint
curl http://localhost:12008/sse

# Test MCP endpoint
curl http://localhost:12008/mcp

# Test API documentation
curl http://localhost:12008/api
```

### 2. Use MCP Inspector

1. **Open MCP Inspector:**
   - Navigate to http://localhost:12008/mcp-inspector

2. **Configure connection:**
   - Transport: SSE
   - URL: `http://localhost:12008/sse`
   - No authentication required

3. **Test operations:**
   - Click "Connect"
   - List available tools
   - Search for "multisynq" in tools
   - Execute `search` tool with query "what is multisynq"

### 3. Test with AI Tools Locally

#### Claude Desktop Configuration

1. **Edit Claude Desktop config:**
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

2. **Add MultiSynq MCP server:**
   ```json
   {
     "mcpServers": {
       "multisynq-local": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-sse", "http://localhost:12008/sse"]
       }
     }
   }
   ```

3. **Restart Claude Desktop** and look for "multisynq-local" in the MCP servers list

#### Cline (VS Code) Configuration

1. **Install Cline extension** in VS Code

2. **Open Cline settings** (Ctrl+Shift+P → "Cline: Open Settings")

3. **Add MCP server:**
   ```json
   {
     "multisynq-local": {
       "command": "npx",
       "args": ["-y", "@modelcontextprotocol/server-sse", "http://localhost:12008/sse"]
     }
   }
   ```

### 4. Test MultiSynq Documentation Retrieval

Once connected via MCP Inspector or an AI tool, test these queries:

```bash
# Example tool calls to test
{
  "tool": "search",
  "query": "what is multisynq"
}

{
  "tool": "search", 
  "query": "how to use activities in multisynq"
}

{
  "tool": "search",
  "query": "multisynq authentication"
}
```

## Running Tests

### Unit Tests
```bash
cd apps/backend
pnpm test:multisynq
```

### Validation Script
```bash
cd apps/backend
node validate-multisynq.mjs
```

### Browser Tests (if browsers installed)
```bash
cd apps/backend
pnpm exec playwright test
```

## Troubleshooting

### Common Issues

1. **Port 12008 already in use:**
   ```bash
   # Find and kill process
   lsof -i :12008
   kill -9 <PID>
   ```

2. **Database connection errors:**
   ```bash
   # Check if postgres is running
   docker-compose ps
   
   # Restart postgres
   docker-compose restart postgres
   ```

3. **MCP connection fails:**
   - Check if backend is running: `curl http://localhost:12008/health`
   - Check browser console for CORS errors
   - Ensure you're using the correct URL

4. **MultiSynq endpoint not initialized:**
   - Check logs: `docker-compose logs app | grep -i multisynq`
   - The initialization happens on startup automatically

### Viewing Logs

```bash
# Docker logs
docker-compose logs -f app

# Backend logs (if running locally)
# Check the terminal where you ran `pnpm dev`

# Database logs
docker-compose logs -f postgres
```

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload in development mode

2. **Database GUI:** Use Prisma Studio to view data:
   ```bash
   cd apps/backend
   pnpm db:studio
   ```

3. **API Testing:** Use the Swagger UI at http://localhost:12008/api for testing OpenAPI endpoints

4. **Rate Limiting:** In local development, rate limiting is set to 100 requests/minute. You can modify this in `apps/backend/src/middleware/rate-limit.middleware.ts`

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

---

**Need Help?** Check the logs first, then refer to the troubleshooting section above. 