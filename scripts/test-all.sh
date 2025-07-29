#!/bin/bash

# Consolidated Test Script for MultiSynq MCP Server

set -e

LOG_FILE="test-results.log"

# Clear the log file
> $LOG_FILE

# Function to log messages to both console and file
log() {
  echo -e "$1" | tee -a $LOG_FILE
}

log "🧪 Starting MultiSynq MCP Test Suite"
log "======================================"

# Run unit tests
log "\n📋 Running Unit Tests..."
if npm run test:multisynq >> $LOG_FILE 2>&1; then
  log "✅ Unit tests passed!"
else
  log "❌ Unit tests failed!"
  exit 1
fi

# Run Playwright tests
log "\n🌐 Running Playwright Tests..."
if pnpm exec playwright test >> $LOG_FILE 2>&1; then
  log "✅ Playwright tests passed!"
else
  log "❌ Playwright tests failed!"
  exit 1
fi

# Run usage tests
log "\n⚙️  Running Usage Tests..."
if node scripts/test-multisynq-usage.js >> $LOG_FILE 2>&1; then
  log "✅ Usage tests passed!"
else
  log "❌ Usage tests failed!"
  exit 1
fi

log "\n🎉 All tests completed successfully!"
log "======================================"
log "✅ MultiSynq MCP integration is ready for deployment"
