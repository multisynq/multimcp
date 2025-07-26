#!/bin/bash

# Master Setup and Run Script for MultiSynq MCP Server
# This script does everything from scratch on a fresh Ubuntu system

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

# Step 2: Run tests
echo -e "${YELLOW}Step 2: Running tests...${NC}"
echo "----------------------------------------"

# Run unit tests
echo -e "${BLUE}Running unit tests...${NC}"
if npm run test:multisynq; then
    echo -e "${GREEN}✅ Unit tests passed!${NC}"
else
    echo -e "${RED}❌ Unit tests failed!${NC}"
    echo -e "${YELLOW}Continuing anyway...${NC}"
fi

# Run validation
echo -e "${BLUE}Running MultiSynq validation...${NC}"
if cd apps/backend && node validate-multisynq.mjs && cd ../..; then
    echo -e "${GREEN}✅ Validation passed!${NC}"
else
    echo -e "${RED}❌ Validation failed!${NC}"
    echo -e "${YELLOW}Continuing anyway...${NC}"
    cd "$PROJECT_ROOT"
fi

echo ""
echo -e "${GREEN}✅ Tests complete!${NC}"
echo ""

# Step 3: Start servers
echo -e "${YELLOW}Step 3: Starting servers...${NC}"
echo "----------------------------------------"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to open URL in browser
open_url() {
    local url=$1
    if command_exists xdg-open; then
        xdg-open "$url" 2>/dev/null &
    elif command_exists open; then
        open "$url" 2>/dev/null &
    elif command_exists start; then
        start "$url" 2>/dev/null &
    else
        echo -e "${YELLOW}Please open $url in your browser${NC}"
    fi
}

# Start the servers in background
echo -e "${BLUE}Starting backend and frontend servers...${NC}"
./scripts/run-local.sh &
SERVER_PID=$!

# Wait for servers to be ready
echo -e "${YELLOW}Waiting for servers to start...${NC}"
sleep 10

# Check if servers are running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Servers are running!${NC}"
else
    echo -e "${RED}❌ Servers failed to start!${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Testing MultiSynq Usage...${NC}"
echo "----------------------------------------"

# Install dependencies for test script
echo -e "${BLUE}Installing test dependencies...${NC}"
cd scripts
npm install --silent
cd ..

# Run usage tests
echo -e "${BLUE}Running MultiSynq usage tests...${NC}"
if node scripts/test-multisynq-usage.js; then
    echo -e "${GREEN}✅ Usage tests passed!${NC}"
else
    echo -e "${RED}❌ Usage tests failed!${NC}"
    echo -e "${YELLOW}Check if the MultiSynq endpoint is properly configured${NC}"
fi

echo ""
echo -e "${YELLOW}Step 5: Opening Inspector...${NC}"
echo "----------------------------------------"

# Open the inspector in browser
INSPECTOR_URL="http://localhost:12008/multisynq"
echo -e "${BLUE}Opening MultiSynq Inspector at: ${YELLOW}$INSPECTOR_URL${NC}"
open_url "$INSPECTOR_URL"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        🎉 Setup Complete! 🎉                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Services are running:${NC}"
echo -e "  Frontend:  ${YELLOW}http://localhost:12008${NC}"
echo -e "  Backend:   ${YELLOW}http://localhost:12009${NC}"
echo -e "  Inspector: ${YELLOW}http://localhost:12008/multisynq${NC}"
echo ""
echo -e "${GREEN}MCP Endpoints:${NC}"
echo -e "  SSE:  ${YELLOW}http://localhost:12009/sse${NC}"
echo -e "  HTTP: ${YELLOW}http://localhost:12009/mcp${NC}"
echo -e "  API:  ${YELLOW}http://localhost:12009/api${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for the server process
wait $SERVER_PID 