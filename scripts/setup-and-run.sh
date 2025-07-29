#!/bin/bash

# Master Setup and Run Script for MultiSynq MCP Server
# This script does everything from scratch on a fresh Ubuntu system

if [ "$(id -u)" -ne 0 ]; then
    echo -e "${YELLOW}Please run this script with sudo: sudo ./scripts/setup-and-run.sh${NC}"
    exit 1
fi

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

echo -e "${BLUE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   MultiSynq MCP Server - Complete Setup      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Step 1: Setup local environment
echo -e "${YELLOW}Step 1: Setting up local environment...${NC}"
echo "----------------------------------------"
if [ -f "./scripts/setup-local-env.sh" ]; then
    chmod +x ./scripts/setup-local-env.sh
    ./scripts/setup-local-env.sh
else
    echo -e "${RED}Error: setup-local-env.sh not found!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""



# Step 3: Fix database configuration
echo -e "${YELLOW}Step 3: Fixing database configuration...${NC}"
echo "----------------------------------------"
cd scripts
pnpm install
pnpm fix-db
cd ..
echo ""
echo -e "${GREEN}✅ Database configuration fixed!${NC}"
echo ""

# Step 4: Run tests
echo -e "${YELLOW}Step 4: Running tests...${NC}"
echo "----------------------------------------"
if ./scripts/test-all.sh; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Tests failed!${NC}"
    echo -e "${YELLOW}Check test-results.log for details.${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 5: Opening Inspector...${NC}"
echo "----------------------------------------"

# Open the inspector in browser
    INSPECTOR_URL="http://localhost:${FRONTEND_PORT}/multisynq"
echo -e "${BLUE}Opening MultiSynq Inspector at: ${YELLOW}$INSPECTOR_URL${NC}"
open_url "$INSPECTOR_URL"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🎉 Setup Complete! 🎉                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services are running:${NC}"
echo -e "  Frontend:  ${YELLOW}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  Backend:   ${YELLOW}http://localhost:${BACKEND_PORT}${NC}"
echo -e "  Inspector: ${YELLOW}http://localhost:${FRONTEND_PORT}/multisynq${NC}"
echo ""
echo -e "${GREEN}MCP Endpoints:${NC}"
echo -e "  SSE:  ${YELLOW}http://localhost:${BACKEND_PORT}/sse${NC}"
echo -e "  HTTP: ${YELLOW}http://localhost:${BACKEND_PORT}/mcp${NC}"
echo -e "  API:  ${YELLOW}http://localhost:${BACKEND_PORT}/api${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for the server process
wait $SERVER_PID 