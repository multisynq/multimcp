# Local Testing Guide for MultiSynq MCP Integration

This guide explains how to run and test the MultiSynq MCP integration locally.

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL 14+ (for local development)
- Docker and Docker Compose (optional, for containerized setup)
- Git repository cloned

## Local Database Setup

### Option 1: Install PostgreSQL Locally (Recommended for Development)

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql    # macOS
```

### Create Database and User

```bash
# Access PostgreSQL prompt
sudo -u postgres psql

# Create user and database
CREATE USER metamcp_user WITH PASSWORD 'm3t4mcp';
CREATE DATABASE metamcp_db OWNER metamcp_user;
GRANT ALL PRIVILEGES ON DATABASE metamcp_db TO metamcp_user;
\q
```

### Option 2: Use Docker for PostgreSQL Only

```bash
# Start PostgreSQL container
docker run -d \
  --name metamcp-postgres \
  -e POSTGRES_USER=metamcp_user \
  -e POSTGRES_PASSWORD=m3t4mcp \
  -e POSTGRES_DB=metamcp_db \
  -p 5432:5432 \
  postgres:16-alpine
```

## Quick Start - Local Development

### 1. Set Up Environment Variables

```bash
# From project root
cd metamcp  # or wherever you cloned the repo

# Create local environment file
cat > .env.local << EOF
# Database Configuration (Local PostgreSQL)
DATABASE_URL=postgresql://metamcp_user:m3t4mcp@localhost:5432/metamcp_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=metamcp_user
POSTGRES_PASSWORD=m3t4mcp
POSTGRES_DB=metamcp_db

# Application Configuration
APP_URL=http://localhost:12008
NEXT_PUBLIC_APP_URL=http://localhost:12008
NODE_ENV=development

# Authentication (use a secure key in production!)
BETTER_AUTH_SECRET=dev-secret-key-change-in-production-at-least-32-chars

# Optional: Enable debug logging
LOG_LEVEL=debug
EOF

# Copy to root .env for convenience
cp .env.local .env
```

### 2. Install Dependencies and Build

```bash
# From project root
pnpm install

# Build all packages
pnpm build
```

### 3. Initialize Database

```bash
# From project root, you can use the convenience script
pnpm db:push:dev

# OR navigate to backend and run directly
cd apps/backend
pnpm db:push:dev

# Optional: Open database GUI (from project root)
pnpm db:studio:dev
```

### 4. Start Development Servers

```bash
# Option 1: From project root (opens two terminals)
pnpm dev:backend  # Terminal 1
pnpm dev:frontend # Terminal 2

# Option 2: Navigate to each app
cd apps/backend && pnpm dev   # Terminal 1
cd apps/frontend && pnpm dev  # Terminal 2
```

### 5. Verify Installation

```bash
# Test health endpoint
curl http://localhost:12008/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-07-25T...",
  "multisynq": {
    "endpoint": "/sse",
    "status": "ready"
  }
}
```

## Docker Compose Setup (Full Stack)

### 1. Using Docker Compose

```bash
# From project root
docker compose up -d

# Check logs
docker compose logs -f app

# Wait for: "✅ MultiSynq root endpoint initialized successfully"
```

### 2. Railway-Compatible Docker Setup

The Docker configuration is designed to work seamlessly with Railway:

- **Database**: Railway automatically provisions PostgreSQL
- **Environment Variables**: Railway injects `DATABASE_URL` and other variables
- **Migrations**: The `docker-entrypoint.sh` script runs migrations automatically
- **Health Checks**: Built-in health check endpoint at `/api/health`

## Testing MultiSynq Integration

### 1. Test Public Endpoints

```bash
# Test SSE endpoint
curl http://localhost:12008/sse

# Test MCP endpoint  
curl http://localhost:12008/mcp

# Test API documentation
curl http://localhost:12008/api

# Test health with MultiSynq status
curl http://localhost:12008/api/health
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

```javascript
// Example tool calls to test
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

## Available Scripts

### Root-Level Scripts (run from project root)

```bash
# Development
pnpm dev              # Start both frontend and backend with hot reload
pnpm dev:backend      # Start only backend
pnpm dev:frontend     # Start only frontend

# Building
pnpm build            # Build all packages
pnpm clean            # Clean all build artifacts

# Database (convenience scripts)
pnpm db:push:dev      # Push schema to local database
pnpm db:studio:dev    # Open Prisma Studio GUI
pnpm db:push          # Push schema (uses .env)
pnpm db:studio        # Open Prisma Studio (uses .env)

# Testing
pnpm test:multisynq   # Run MultiSynq tests
pnpm test:playwright  # Run browser tests

# Docker
pnpm docker:up        # Start with docker compose
pnpm docker:down      # Stop docker services
pnpm docker:logs      # View docker logs

# Linting
pnpm lint             # Run linting
pnpm lint:fix         # Fix linting issues
```

### Backend Scripts (in apps/backend)

```bash
# Development
pnpm dev              # Start development server with hot reload

# Database Management
pnpm db:push:dev      # Push schema to local database
pnpm db:studio:dev    # Open Prisma Studio GUI
pnpm db:generate:dev  # Generate Prisma client
pnpm db:migrate:dev   # Run migrations
pnpm db:reset         # Reset and seed database

# Testing
pnpm test:multisynq   # Run MultiSynq tests
pnpm test             # Run all tests
pnpm test:playwright  # Run browser tests

# Building
pnpm build            # Build for production
pnpm start            # Start production build
```

## Database Management

### View Database with Prisma Studio

```bash
# From project root
pnpm db:studio:dev

# OR from backend directory
cd apps/backend
pnpm db:studio:dev

# Opens at http://localhost:5555
```

### Reset Database

```bash
cd apps/backend
pnpm db:reset
```

### Manual Database Operations

```bash
# Connect to PostgreSQL
psql -U metamcp_user -d metamcp_db -h localhost

# Common queries
\dt                    # List all tables
\d+ "table_name"      # Describe table
SELECT * FROM users;   # Query data
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
   # Check PostgreSQL is running
   sudo systemctl status postgresql  # Linux
   brew services list                 # macOS
   
   # Check connection
   psql -U metamcp_user -d metamcp_db -h localhost -c "SELECT 1"
   
   # Common fix: ensure PostgreSQL is listening on localhost
   # Edit postgresql.conf and set: listen_addresses = 'localhost'
   ```

3. **pnpm command not found:**
   ```bash
   # Install pnpm
   npm install -g pnpm
   # or
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   ```

4. **Build errors:**
   ```bash
   # Clean and rebuild
   pnpm clean
   pnpm install
   pnpm build
   ```

5. **MultiSynq endpoint not initialized:**
   - Check backend logs for errors
   - Ensure database is accessible
   - Verify Context7 MCP server is installed in Docker image
   - The initialization should happen automatically on startup

6. **"Cannot find module" errors:**
   ```bash
   # Ensure all packages are built
   pnpm build
   
   # If specific package fails, build it directly
   cd packages/zod-types && pnpm build
   cd packages/trpc && pnpm build
   ```

### Viewing Logs

```bash
# Backend logs (development)
# Check the terminal where you ran `pnpm dev`

# Docker logs
docker compose logs -f app

# PostgreSQL logs
sudo journalctl -u postgresql  # Linux
tail -f /opt/homebrew/var/log/postgresql*.log  # macOS

# Check specific initialization
docker compose logs app | grep -i multisynq
```

## Railway Deployment Compatibility

The local setup is designed to work seamlessly with Railway deployment:

1. **Database**: Railway provides PostgreSQL automatically
2. **Environment Variables**: Railway injects DATABASE_URL and other vars
3. **Docker**: The Dockerfile handles both local and Railway environments
4. **Health Checks**: Same endpoints work locally and on Railway

## Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload in development mode

2. **Environment Variables:** 
   - Use `.env.local` for local development
   - Use `.env` for Docker
   - Never commit these files to git

3. **API Testing:** Use the Swagger UI at http://localhost:12008/api

4. **Rate Limiting:** In local development, rate limiting is set to 100 requests/minute

5. **Security Headers:** Relaxed in development for easier testing

6. **Database GUI:** Prisma Studio provides a visual interface for your data

## Stopping Services

```bash
# Stop local development servers
# Press Ctrl+C in each terminal

# Stop Docker services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v

# Stop PostgreSQL
sudo systemctl stop postgresql  # Linux
brew services stop postgresql    # macOS

# Stop PostgreSQL Docker container
docker stop metamcp-postgres
docker rm metamcp-postgres
```

---

**Need Help?** 
1. Check the logs first
2. Verify PostgreSQL is running and accessible
3. Ensure all dependencies are installed with `pnpm install`
4. Make sure all packages are built with `pnpm build`
5. Check the troubleshooting section above 