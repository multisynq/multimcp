# 🚀 MultiSynq MCP Server

<div align="center">

<div align="center">
  <a href="https://multisynq.io" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/MultiSynq-MCP_Server-7C3AED?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMyA3VjE3TDEyIDIyTDIxIDE3VjdMMTIgMloiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4=" alt="MultiSynq" style="max-width: 100%;">
  </a>
  <a href="https://github.com/multisynq/multimcp" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/GitHub-multisynq%2Fmultimcp-181717?style=flat-square&logo=github" alt="GitHub" style="max-width: 100%;">
  </a>
  <a href="https://opensource.org/licenses/MIT" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="MIT License" style="max-width: 100%;">
  </a>
  <a href="https://railway.app" style="text-decoration: none;">
    <img src="https://img.shields.io/badge/Deploy-Railway-0B0D0E?style=flat-square&logo=railway" alt="Railway" style="max-width: 100%;">
  </a>
</div>

</div>

**MultiSynq MCP Server** is a customized MCP (Model Context Protocol) server that provides seamless access to MultiSynq documentation and capabilities. Built on MetaMCP, it extends the platform with pre-configured MultiSynq integration, allowing AI tools to understand and work with MultiSynq's activity-based architecture.

## 🌟 Key Features

- **🔍 MultiSynq Documentation Access**: Pre-configured Context7 integration for instant access to MultiSynq docs
- **🚀 Zero Configuration**: Works out of the box with public endpoints at `/sse`, `/mcp`, and `/api`
- **🔐 Flexible Authentication**: Supports both public access and API key authentication
- **🛠️ Developer Friendly**: Built-in MCP Inspector for testing and debugging
- **📦 Production Ready**: Includes rate limiting, security headers, and health checks
- **☁️ Railway Deployable**: One-click deployment to Railway with PostgreSQL

---

> **Note**: This is a customized fork of [MetaMCP](https://github.com/metatool-ai/metamcp) specifically tailored for MultiSynq's needs.

## 📋 Table of Contents

- [🎯 Use Cases](#-use-cases)
- [📖 Concepts](#-concepts)
  - [🖥️ MCP Server](#️-mcp-server)
  - [🏷️ MetaMCP Namespace](#️-metamcp-namespace)
  - [🌐 MetaMCP Endpoint](#-metamcp-endpoint)
  - [⚙️ Middleware](#️-middleware)
  - [🔍 Inspector](#-inspector)
- [🚀 Quick Start](#-quick-start)
  - [🐳 Run with Docker Compose (Recommended)](#-run-with-docker-compose-recommended)
  - [💻 Local Development](#-local-development)
- [🔌 MCP Protocol Compatibility](#-mcp-protocol-compatibility)
- [🔗 Connect to MetaMCP](#-connect-to-metamcp)
  - [📝 E.g., Cursor via mcp.json](#-eg-cursor-via-mcpjson)
  - [🖥️ Connecting Claude Desktop and Other STDIO-only Clients](#️-connecting-claude-desktop-and-other-stdio-only-clients)
  - [🔧 API Key Auth Troubleshooting](#-api-key-auth-troubleshooting)
- [❄️ Cold Start Problem and Custom Dockerfile](#️-cold-start-problem-and-custom-dockerfile)
- [🔐 Authentication](#-authentication)
- [🔗 OpenID Connect (OIDC) Provider Support](#-openid-connect-oidc-provider-support)
  - [🛠️ Configuration](#️-configuration)
  - [🏢 Supported Providers](#-supported-providers)
  - [🔒 Security Features](#-security-features)
  - [📱 Usage](#-usage)
- [🌐 Custom Deployment and SSE conf for Nginx](#-custom-deployment-and-sse-conf-for-nginx)
- [🏗️ Architecture](#️-architecture)
  - [📊 Sequence Diagram](#-sequence-diagram)
- [🗺️ Roadmap](#️-roadmap)
- [🌐 i18n](#-i18n)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Credits](#-credits)


## 🎯 What is MultiSynq MCP Server?

The MultiSynq MCP Server enables AI tools like Claude, Cursor, and Cline to understand and work with MultiSynq's activity-based architecture. It provides:

- **📚 Instant Documentation Access**: AI tools can search and retrieve MultiSynq documentation
- **🔧 Activity Patterns**: Understand how to implement activities, timelines, and sync
- **🏗️ Architecture Guidance**: Get best practices for building with MultiSynq
- **🚀 Code Examples**: Access real-world examples and implementation patterns

### How It Works

```mermaid
graph LR
    A[AI Tool] -->|MCP Protocol| B[MultiSynq MCP Server]
    B -->|Context7| C[MultiSynq Docs]
    B -->|Returns| D[Relevant Information]
    D --> A
```

## 📖 Concepts

### 🖥️ **MCP Server**
A MCP server configuration that tells MetaMCP how to start a MCP server.

```json
"HackerNews": {
  "type": "STDIO",
  "command": "uvx",
  "args": ["mcp-hn"]
}
```

### 🏷️ **MetaMCP Namespace**
- Group one or more MCP servers into a namespace
- Enable/disable MCP servers or at tool level
- Apply middlewares to MCP requests and responses

### 🌐 **MetaMCP Endpoint**
- Create endpoints and assign namespace to endpoints
- Multiple MCP servers in the namespace will be aggregated and emitted as a MetaMCP endpoint
- Choose auth level and strategy
- Host through **SSE** or **Streamable HTTP** transports in MCP and **OpenAPI** endpoints for clients like [Open WebUI](https://github.com/open-webui/open-webui)

### ⚙️ **Middleware**
- Intercepts and transforms MCP requests and responses at namespace level
- **Built-in example**: "Filter inactive tools" - optimizes tool context for LLMs
- **Future ideas**: tool logging, error traces, validation, scanning

### 🔍 **Inspector**
Similar to the official MCP inspector, but with **saved server configs** - MetaMCP automatically creates configurations so you can debug MetaMCP endpoints immediately.

## 🚀 Quick Start

### 🚀 Quick Local Development Setup

For local development with MultiSynq integration:

```bash
# 1. Clone the repository
git clone https://github.com/multisynq/multimcp.git
cd multimcp

# 2. Install dependencies
pnpm install

# 3. Set up local PostgreSQL database
# Option A: Install PostgreSQL locally
sudo apt install postgresql  # Ubuntu/Debian
brew install postgresql      # macOS

# Option B: Use Docker for PostgreSQL only
docker run -d --name metamcp-postgres \
  -e POSTGRES_USER=metamcp_user \
  -e POSTGRES_PASSWORD=m3t4mcp \
  -e POSTGRES_DB=metamcp_db \
  -p 5432:5432 \
  postgres:16-alpine

# 4. Set up environment variables
cat > .env.local << EOF
DATABASE_URL=postgresql://metamcp_user:m3t4mcp@localhost:5432/metamcp_db
BETTER_AUTH_SECRET=dev-secret-key-at-least-32-chars
APP_URL=http://localhost:12008
NEXT_PUBLIC_APP_URL=http://localhost:12008
NODE_ENV=development
EOF

# 5. Build packages and initialize database
pnpm build
pnpm db:push:dev

# 6. Start development servers
pnpm dev:backend  # Terminal 1
pnpm dev:frontend # Terminal 2

# 7. Test MultiSynq integration
curl http://localhost:12008/api/health
# Open http://localhost:12008/mcp-inspector
```

For detailed instructions, see [LOCAL_TESTING_GUIDE.md](LOCAL_TESTING_GUIDE.md)

### **🐳 Run with Docker Compose (Recommended for Production)**

Clone repo, prepare `.env`, and start with docker compose:

```bash
git clone https://github.com/multisynq/multimcp.git
cd multimcp
cp example.env .env
# Edit .env with your configuration
docker compose up -d
```

If you modify APP_URL env vars, make sure you only access from the APP_URL, because MetaMCP enforces CORS policy on the URL, so no other URL is accessible.

Note that the pg volume name may collide with your other pg dockers, which is global, consider rename it in `docker-compose.yml`:

```
volumes:
  metamcp_postgres_data:
    driver: local
```

### **💻 Local Development**

Still recommend running postgres through docker for easy setup:

```bash
pnpm install
pnpm dev
```

## 🔌 MCP Protocol Compatibility

- ✅ **Tools, Resources, and Prompts** supported
- ✅ **OAuth-enabled MCP servers** tested for 03-26 version

If you have questions, feel free to leave **GitHub issues** or **PRs**.

## 🔗 Connect to MetaMCP

### 📝 Connecting to MultiSynq MCP Server

#### For Cursor (via mcp.json)

```json
{
  "mcpServers": {
    "multisynq": {
      "url": "http://localhost:12008/sse"
    }
  }
}
```

Or for production:

```json
{
  "mcpServers": {
    "multisynq": {
      "url": "https://mcp.multisynq.io/sse"
    }
  }
}
```

#### For Claude Desktop

Since the MultiSynq MCP Server uses SSE (Server-Sent Events), Claude Desktop needs the MCP SSE client:

```json
{
  "mcpServers": {
    "multisynq": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sse", "http://localhost:12008/sse"]
    }
  }
}
```

Or for production:

```json
{
  "mcpServers": {
    "multisynq": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sse", "https://mcp.multisynq.io/sse"]
    }
  }
}
```

#### For Cline (VS Code Extension)

Add to your Cline settings:

```json
{
  "multisynq": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-sse", "http://localhost:12008/sse"]
  }
}
```

### 🔧 Authentication Notes

The MultiSynq MCP Server's public endpoints (`/sse`, `/mcp`, `/api`) are configured for **public access** by default - no authentication required! This makes it easy to get started.

For production deployments, you can enable API key authentication through the dashboard.

## 🚀 Production Deployment

The MultiSynq MCP Server is optimized for production deployment on Railway:

- **Pre-configured**: Context7 MCP server is pre-installed in the Docker image
- **Fast startup**: Idle sessions pre-allocated for instant response
- **Health checks**: Built-in health endpoints for monitoring
- **Auto-scaling**: Works seamlessly with Railway's scaling features

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for detailed deployment instructions.

## 🔐 Authentication

- 🛡️ **Better Auth** for frontend & backend (TRPC procedures)
- 🍪 **Session cookies** enforce secure internal MCP proxy connections
- 🔑 **API key authentication** for external access via `Authorization: Bearer <api-key>` header
- 🏢 **Multi-tenancy**: Designed for organizations to deploy on their own machines. Supports both private and public access scopes. Users can create MCPs, namespaces, endpoints, and API keys for themselves or for everyone. Public API keys cannot access private MetaMCPs.

## 🔗 OpenID Connect (OIDC) Provider Support

MetaMCP supports **OpenID Connect authentication** for enterprise SSO integration. This allows organizations to use their existing identity providers (Auth0, Keycloak, Azure AD, etc.) for authentication.

### 🛠️ **Configuration**

Add the following environment variables to your `.env` file:

```bash
# Required
OIDC_CLIENT_ID=your-oidc-client-id
OIDC_CLIENT_SECRET=your-oidc-client-secret
OIDC_DISCOVERY_URL=https://your-provider.com/.well-known/openid-configuration

# Optional customization
OIDC_PROVIDER_ID=oidc
OIDC_SCOPES=openid email profile
OIDC_PKCE=true
```

### 🏢 **Supported Providers**

MetaMCP has been tested with popular OIDC providers:

- **Auth0**: `https://your-domain.auth0.com/.well-known/openid-configuration`
- **Keycloak**: `https://your-keycloak.com/realms/your-realm/.well-known/openid-configuration`
- **Azure AD**: `https://login.microsoftonline.com/your-tenant-id/v2.0/.well-known/openid-configuration`
- **Google**: `https://accounts.google.com/.well-known/openid-configuration`
- **Okta**: `https://your-domain.okta.com/.well-known/openid-configuration`

### 🔒 **Security Features**

- 🔐 **PKCE (Proof Key for Code Exchange)** enabled by default
- 🛡️ **Authorization Code Flow** with automatic user creation
- 🔄 **Auto-discovery** of OIDC endpoints
- 🍪 **Seamless session management** with existing auth system

### 📱 **Usage**

Once configured, users will see a **"Sign in with OIDC"** button on the login page alongside the email/password form. The authentication flow automatically creates new users on first login.

For more detailed configuration examples and troubleshooting, see **[CONTRIBUTING.md](CONTRIBUTING.md#openid-connect-oidc-provider-setup)**.

## 🌐 Custom Deployment and SSE conf for Nginx

If you want to deploy it to a online service or a VPS, a instance of at least 2GB-4GB of memory is required. And the larger size, the better performance.

Since MCP leverages SSE for long connection, if you are using reverse proxy like nginx, please refer to an example setup [nginx.conf.example](nginx.conf.example)

## 🏗️ Architecture

The MultiSynq MCP Server is built with:

- **Frontend**: Next.js with MCP Inspector for testing
- **Backend**: Express.js with tRPC and MultiSynq integration
- **Database**: PostgreSQL for configuration and state
- **MCP Integration**: Context7 for MultiSynq documentation access
- **Deployment**: Docker + Railway for production

### 📊 How MultiSynq Integration Works

```mermaid
sequenceDiagram
    participant AI as AI Tool (Claude/Cursor)
    participant MCP as MultiSynq MCP Server
    participant C7 as Context7
    participant Docs as MultiSynq Docs

    AI ->> MCP: search("how to create activity")
    MCP ->> C7: Query MultiSynq documentation
    C7 ->> Docs: Retrieve relevant sections
    Docs ->> C7: Return documentation
    C7 ->> MCP: Formatted results
    MCP ->> AI: Activity creation guide + examples
```

## 🗺️ Roadmap

**Current Status**: ✅ Production Ready with MultiSynq Integration

**Completed Features**:
- ✅ MultiSynq documentation access via Context7
- ✅ Public endpoints at `/sse`, `/mcp`, `/api`
- ✅ Rate limiting and security headers
- ✅ Railway deployment configuration
- ✅ Comprehensive test coverage
- ✅ MCP Inspector integration

**Future Enhancements**:
- [ ] 🔍 Enhanced search capabilities for MultiSynq patterns
- [ ] 📚 Additional MultiSynq-specific tools
- [ ] 🧪 Integration with MultiSynq playground
- [ ] 📊 Usage analytics and insights

## 🤝 Contributing

We welcome contributions! This is an open-source project maintained by MultiSynq.

- **Report Issues**: [GitHub Issues](https://github.com/multisynq/multimcp/issues)
- **Submit PRs**: [GitHub Pull Requests](https://github.com/multisynq/multimcp/pulls)
- **Documentation**: Improvements to docs always welcome!

## 📄 License

**MIT** - See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This project is built on top of the excellent [MetaMCP](https://github.com/metatool-ai/metamcp) platform. Special thanks to:

- The MetaMCP team for creating the foundational MCP aggregation platform
- The Model Context Protocol team for the MCP specification
- Context7 for enabling seamless documentation access

---

**Built with ❤️ by [MultiSynq](https://multisynq.io)**
