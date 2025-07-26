# Quick Reference - MultiSynq MCP Integration

## 🚀 Quick Start Commands

### Local Development Setup

```bash
# 1. Clone and install
git clone https://github.com/metatool-ai/metamcp.git
cd metamcp
pnpm install

# 2. Set up PostgreSQL (choose one)
# Option A: Local PostgreSQL
sudo apt install postgresql     # Ubuntu
brew install postgresql         # macOS

# Option B: Docker PostgreSQL
docker run -d --name metamcp-postgres \
  -e POSTGRES_USER=metamcp_user \
  -e POSTGRES_PASSWORD=m3t4mcp \
  -e POSTGRES_DB=metamcp_db \
  -p 5432:5432 \
  postgres:16-alpine

# 3. Configure environment
cat > .env.local << EOF
DATABASE_URL=postgresql://metamcp_user:m3t4mcp@localhost:5432/metamcp_db
BETTER_AUTH_SECRET=dev-secret-key-at-least-32-chars
APP_URL=http://localhost:12008
NEXT_PUBLIC_APP_URL=http://localhost:12008
EOF

# 4. Build and initialize
pnpm build
pnpm db:push:dev

# 5. Start servers
pnpm dev:backend   # Terminal 1
pnpm dev:frontend  # Terminal 2
```

### Docker Setup

```bash
# Start everything with Docker
cp example.env .env
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down
```

## 📝 Common Commands

### Development
```bash
pnpm dev              # Start all dev servers
pnpm dev:backend      # Backend only
pnpm dev:frontend     # Frontend only
pnpm build           # Build all packages
pnpm clean           # Clean build artifacts
```

### Database
```bash
pnpm db:push:dev     # Push schema to local DB
pnpm db:studio:dev   # Open Prisma Studio GUI
pnpm db:reset        # Reset database (in backend dir)
```

### Testing
```bash
pnpm test:multisynq  # Run MultiSynq tests
pnpm lint            # Run linting
pnpm lint:fix        # Fix linting issues
```

### Docker
```bash
pnpm docker:up       # Start Docker services
pnpm docker:down     # Stop Docker services
pnpm docker:logs     # View Docker logs
```

## 🧪 Test Endpoints

```bash
# Health check
curl http://localhost:12008/api/health

# SSE endpoint
curl http://localhost:12008/sse

# MCP Inspector
open http://localhost:12008/mcp-inspector
```

## 🔧 Troubleshooting

### Port in use
```bash
lsof -i :12008
kill -9 <PID>
```

### Database connection issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql   # Linux
brew services list                  # macOS

# Test connection
psql -U metamcp_user -d metamcp_db -h localhost -c "SELECT 1"
```

### Build errors
```bash
pnpm clean
pnpm install
pnpm build
```

### Module not found
```bash
# Rebuild specific packages
cd packages/zod-types && pnpm build
cd packages/trpc && pnpm build
```

## 📁 Project Structure

```
metamcp/
├── apps/
│   ├── backend/         # Express + tRPC backend
│   └── frontend/        # Next.js frontend
├── packages/
│   ├── trpc/           # Shared tRPC types
│   ├── zod-types/      # Shared Zod schemas
│   └── eslint-config/  # ESLint configuration
├── .env.local          # Local dev environment
├── docker-compose.yml  # Docker configuration
└── railway.json        # Railway deployment config
```

## 🔗 Important URLs

- **Local App**: http://localhost:12008
- **MCP Inspector**: http://localhost:12008/mcp-inspector
- **API Docs**: http://localhost:12008/api
- **Health Check**: http://localhost:12008/api/health
- **Prisma Studio**: http://localhost:5555 (when running)

## 📚 Documentation

- [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md) - Detailed local setup
- [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Production deployment
- [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) - Pre-deployment checklist
- [roadmap.md](roadmap.md) - Project progress and roadmap 