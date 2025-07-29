#!/bin/bash

# End-to-End Test Runner for MultiSynq MCP Server

set -e

# Colors for output
RED='
033[0;31m'
GREEN='
033[0;32m'
YELLOW='
033[1;33m'
NC='
033[0m' # No Color

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

# Start servers in background
./scripts/run-local.sh &
SERVER_PID=$!

# Function to cleanup on exit
cleanup() {
    echo -e "
${YELLOW}Shutting down services...${NC}"
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    wait $SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}Services stopped${NC}"
}

# Trap signals for graceful shutdown
trap cleanup TERM INT EXIT

# Wait for servers to be ready
echo -e "${YELLOW}Waiting for servers to start...${NC}"
sleep 15

# Run Playwright tests
echo -e "${GREEN}Running Playwright tests...${NC}"
pnpm test:playwright

# Run MultiSynq usage tests
echo -e "${GREEN}Running MultiSynq usage tests...${NC}"
pnpm test:multisynq

