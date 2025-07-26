# Railway Deployment Guide for MultiSynq MCP Integration

This guide provides step-by-step instructions for deploying the MultiSynq MCP integration to Railway.

## Prerequisites

- Railway account with a Pro plan (for custom domains)
- GitHub repository connected to Railway
- Domain access for `mcp.multisynq.io`

## Environment Variables

Configure these variables in Railway's dashboard:

### Required Variables

```bash
# Database (Railway provides these automatically with Postgres addon)
DATABASE_URL=postgresql://postgres:password@hostname:5432/railway
POSTGRES_HOST=hostname
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=railway

# Application
APP_URL=https://mcp.multisynq.io
NEXT_PUBLIC_APP_URL=https://mcp.multisynq.io
NODE_ENV=production
PORT=12008

# Authentication (generate a secure 32+ character string)
BETTER_AUTH_SECRET=your-production-secret-key-at-least-32-chars

# Railway Specific
RAILWAY_ENVIRONMENT=production
```

### Optional Variables

```bash
# Context7 (if external API needed)
CONTEXT7_API_KEY=your-api-key-if-needed

# Security
CORS_ALLOWED_ORIGINS=https://mcp.multisynq.io,https://multisynq.io

# Performance
MAX_CONNECTIONS=100
CONNECTION_TIMEOUT=30000

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

## Deployment Steps

### 1. Initial Setup

1. **Create New Project in Railway**
   ```bash
   railway login
   railway init
   ```

2. **Add PostgreSQL Database**
   - In Railway dashboard, click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically inject database credentials

3. **Connect GitHub Repository**
   - Go to Settings → Connect GitHub repo
   - Select the repository and branch

### 2. Configure Environment

1. **Add Environment Variables**
   - Navigate to Variables tab
   - Add all required variables listed above
   - Generate secure BETTER_AUTH_SECRET:
     ```bash
     openssl rand -base64 32
     ```

2. **Configure Build Settings**
   - Railway will auto-detect Dockerfile
   - Verify build command: Docker build
   - Verify start command: From Dockerfile

### 3. Deploy Application

1. **Trigger Deployment**
   ```bash
   git push origin main
   # Or manually in Railway dashboard
   ```

2. **Monitor Build**
   - Watch build logs in Railway dashboard
   - Ensure all steps complete successfully

3. **Verify Health Check**
   - Once deployed, check: `https://your-app.railway.app/api/health`
   - Should return:
     ```json
     {
       "status": "ok",
       "timestamp": "2024-07-25T...",
       "multisynq": {
         "endpoint": "/sse",
         "status": "ready"
       }
     }
     ```

### 4. Configure Custom Domain

1. **Add Domain in Railway**
   - Go to Settings → Domains
   - Add `mcp.multisynq.io`
   - Copy the CNAME target

2. **Update DNS Records**
   - Add CNAME record:
     ```
     Type: CNAME
     Name: mcp
     Value: [Railway CNAME target]
     TTL: 300
     ```

3. **Wait for SSL Certificate**
   - Railway automatically provisions Let's Encrypt SSL
   - Usually ready within 5-10 minutes

### 5. Post-Deployment Verification

1. **Test Endpoints**
   ```bash
   # Health check
   curl https://mcp.multisynq.io/api/health

   # SSE endpoint
   curl https://mcp.multisynq.io/sse

   # MCP endpoint
   curl https://mcp.multisynq.io/mcp

   # OpenAPI
   curl https://mcp.multisynq.io/api
   ```

2. **Test with MCP Inspector**
   - Navigate to https://mcp.multisynq.io/mcp-inspector
   - Configure server:
     - Transport: SSE
     - URL: https://mcp.multisynq.io/sse
   - Test connection and tools

3. **Test with AI Tools**
   ```bash
   # Example with Claude Desktop
   {
     "mcpServers": {
       "multisynq": {
         "command": "npx",
         "args": ["-y", "@modelcontextprotocol/server-sse", "https://mcp.multisynq.io/sse"]
       }
     }
   }
   ```

## Monitoring & Maintenance

### Health Monitoring

1. **Set Up Uptime Monitoring**
   - Use Railway's built-in metrics
   - Add external monitoring (e.g., UptimeRobot)
   - Monitor endpoint: `https://mcp.multisynq.io/api/health`

2. **Configure Alerts**
   - Memory usage > 80%
   - CPU usage > 70%
   - Response time > 1000ms
   - Error rate > 1%

### Performance Optimization

1. **Enable Autoscaling**
   - In Railway Settings → Scaling
   - Set min/max instances
   - Configure CPU/Memory thresholds

2. **Resource Limits**
   ```yaml
   # Recommended starting values
   Memory: 512MB - 1GB
   CPU: 0.5 - 1 vCPU
   ```

3. **Caching Strategy**
   - Context7 responses are cached locally
   - Consider Redis for session storage
   - Enable CDN for static assets

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check `@repo/trpc` is built
   - Verify all dependencies installed
   - Check Docker build logs

2. **Database Connection**
   - Verify DATABASE_URL is correct
   - Check PostgreSQL addon is running
   - Test connection from Railway shell

3. **CORS Errors**
   - Update CORS_ALLOWED_ORIGINS
   - Verify domain configuration
   - Check browser console for details

### Debug Commands

```bash
# Railway CLI debugging
railway logs
railway run node --version
railway run npm list

# Database connection test
railway run npx prisma db push
railway run npx prisma studio

# Environment check
railway run env | grep -E "DATABASE|APP_URL|NODE_ENV"
```

## Rollback Procedure

If issues arise:

1. **Immediate Rollback**
   - In Railway dashboard → Deployments
   - Click on previous successful deployment
   - Select "Rollback to this deployment"

2. **Database Rollback**
   - If schema changes were made:
     ```bash
     railway run npx prisma migrate rollback
     ```

## Security Checklist

- [ ] BETTER_AUTH_SECRET is unique and secure
- [ ] Database credentials are not exposed
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] SSL certificate is active
- [ ] Health check doesn't expose sensitive data

## Support

For issues specific to:
- **Railway Platform**: support@railway.app
- **MultiSynq Integration**: Create issue in GitHub repo
- **Context7 MCP**: Check Context7 documentation

---

Last Updated: 2024-07-25 