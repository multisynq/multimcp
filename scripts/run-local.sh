#!/bin/bash

# Run Local Script for MultiSynq MCP Server
# This script starts the backend and frontend servers locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}MultiSynq MCP Server - Starting Local Instance${NC}"
echo "=============================================="

# Function to check if PostgreSQL is running
is_postgres_running() {
    if command -v systemctl >/dev/null 2>&1; then
        systemctl is-active --quiet postgresql
    else
        pgrep postgres >/dev/null 2>&1
    fi
}

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo -e "${RED}❌ .env file not found. Run ./scripts/setup-local-env.sh first.${NC}"
    exit 1
fi

# Check if PostgreSQL is running
if ! is_postgres_running; then
    echo -e "${RED}PostgreSQL is not running. Starting it...${NC}"
    sudo systemctl start postgresql
    sleep 2
fi

# Test PostgreSQL connection
echo -e "${YELLOW}Testing PostgreSQL connection...${NC}"
if PGPASSWORD=m3t4mcp psql -h localhost -U metamcp_user -d metamcp_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL connection successful!${NC}"
else
    echo -e "${RED}❌ PostgreSQL connection failed. Run ./scripts/setup-local-env.sh first.${NC}"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    pnpm install
fi

# Check if build exists
if [ ! -d "apps/backend/dist" ]; then
    echo -e "${YELLOW}Building the project...${NC}"
    pnpm build
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    wait $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}Services stopped${NC}"
}

# Trap signals for graceful shutdown
trap cleanup TERM INT

# Start backend server
echo -e "${YELLOW}Starting backend server on port 12009...${NC}"
cd apps/backend
DATABASE_URL="$DATABASE_URL" PORT=12009 node dist/index.js &
BACKEND_PID=$!
cd ../..

# Wait for backend to start
sleep 3

# Check if backend is still running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Backend server failed to start!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend server started successfully (PID: $BACKEND_PID)${NC}"

# Start frontend server
echo -e "${YELLOW}Starting frontend server on port 12008...${NC}"
cd apps/frontend
PORT=12008 pnpm dev &
FRONTEND_PID=$!
cd ../..

# Wait for frontend to start
sleep 5

# Check if frontend is still running
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Frontend server failed to start!${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
echo -e "${GREEN}✅ Frontend server started successfully (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}Services started successfully!${NC}"
echo -e "Frontend: ${YELLOW}http://localhost:12008${NC}"
echo -e "Backend:  ${YELLOW}http://localhost:12009${NC}"
echo -e "Inspector: ${YELLOW}http://localhost:12008/multisynq${NC}"
echo ""
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo ""

# Wait for both processes
wait $BACKEND_PID
wait $FRONTEND_PID 