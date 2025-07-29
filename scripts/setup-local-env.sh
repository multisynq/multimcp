#!/bin/bash

# Setup Local Environment Script for MultiSynq MCP Server
# This script sets up PostgreSQL and all dependencies on a fresh Ubuntu system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}MultiSynq MCP Server - Local Environment Setup${NC}"
echo "=============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if PostgreSQL is running
is_postgres_running() {
    if command_exists systemctl; then
        systemctl is-active --quiet postgresql
    else
        pgrep postgres >/dev/null 2>&1
    fi
}

# Check if running as root


# Check if we already have a .env file
if [ -f .env ]; then
    echo -e "${YELLOW}Found existing .env file. Loading environment variables...${NC}"
    export $(grep -v '^#' .env | xargs)
fi

# Update package list
echo -e "${YELLOW}Updating package list...${NC}"
apt-get update -y

# Install essential tools
echo -e "${YELLOW}Installing essential tools...${NC}"
sudo apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common

# Install Node.js if not present
if ! command_exists node; then
    echo -e "${YELLOW}Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo -e "${GREEN}Node.js already installed: $(node --version)${NC}"
fi

# Install pnpm if not present
if ! command_exists pnpm; then
    echo -e "${YELLOW}Installing pnpm...${NC}"
    npm install -g pnpm
else
    echo -e "${GREEN}pnpm already installed: $(pnpm --version)${NC}"
fi

# Install PostgreSQL if not present
if ! command_exists psql; then
    echo -e "${YELLOW}Installing PostgreSQL...${NC}"
    sudo apt-get install -y postgresql postgresql-contrib
else
    echo -e "${GREEN}PostgreSQL already installed: $(psql --version)${NC}"
fi

# Start PostgreSQL service
echo -e "${YELLOW}Starting PostgreSQL service...${NC}"
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Wait for PostgreSQL to be ready
sleep 2

# Setup PostgreSQL user and database
echo -e "${YELLOW}Setting up PostgreSQL database...${NC}"

# Create metamcp_user and database (handle various scenarios)
sudo -u postgres psql << EOF 2>/dev/null || true
-- Create user if not exists
DO
\$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'metamcp_user') THEN
    CREATE USER metamcp_user WITH PASSWORD 'm3t4mcp';
  END IF;
END
\$\$;

-- Ensure metamcp_user has password
ALTER USER metamcp_user WITH PASSWORD 'm3t4mcp';

-- Create metamcp_db database if not exists
SELECT 'CREATE DATABASE metamcp_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'metamcp_db')\gexec

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE metamcp_db TO metamcp_user;

-- Also ensure metamcp_user can create schemas
ALTER DATABASE metamcp_db OWNER TO metamcp_user;
EOF

# Update PostgreSQL authentication method to allow password auth for local connections
echo -e "${YELLOW}Configuring PostgreSQL authentication...${NC}"
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1 | cut -d. -f1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

if [ -d "$PG_CONFIG_DIR" ]; then
    # Backup original pg_hba.conf
    sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Update pg_hba.conf to use md5 authentication for local connections
    sudo tee "$PG_CONFIG_DIR/pg_hba.conf" > /dev/null << 'EOF'
# Database administrative login by Unix domain socket
local   all             postgres                                peer

# TYPE  DATABASE        USER            ADDRESS                 METHOD
# "local" is for Unix domain socket connections only
local   all             all                                     md5
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     peer
host    replication     all             127.0.0.1/32            md5
host    replication     all             ::1/128                 md5
EOF

    # Restart PostgreSQL to apply changes
    echo -e "${YELLOW}Restarting PostgreSQL...${NC}"
    sudo systemctl restart postgresql
    sleep 2
fi

# Test PostgreSQL connection
echo -e "${YELLOW}Testing PostgreSQL connection...${NC}"
if PGPASSWORD=m3t4mcp psql -h localhost -U metamcp_user -d metamcp_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL connection successful!${NC}"
else
    echo -e "${RED}❌ PostgreSQL connection failed. Please check the logs.${NC}"
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << 'EOF'
# Database
DATABASE_URL=postgresql://metamcp_user:m3t4mcp@localhost:5432/metamcp_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=metamcp_user
POSTGRES_PASSWORD=m3t4mcp
POSTGRES_DB=metamcp_db

# Application
NODE_ENV=development
APP_URL=http://localhost:12008
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production

# Ports
FRONTEND_PORT=12008
BACKEND_PORT=12009
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Install project dependencies
echo -e "${YELLOW}Installing project dependencies...${NC}"
pnpm install

# Build the project
echo -e "${YELLOW}Building the project...${NC}"
pnpm build

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
cd apps/backend
pnpm db:push
cd ../..

echo -e "${GREEN}✅ Local environment setup complete!${NC}"
echo ""
echo "PostgreSQL is running with:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  User: metamcp_user"
echo "  Password: m3t4mcp"
echo "  Database: metamcp_db"
echo ""
echo "You can now run the application with:"
echo "  ./scripts/run-local.sh"
echo ""
echo "Or run the full setup with:"
echo "  ./scripts/setup-and-run.sh" 