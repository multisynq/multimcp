#!/bin/bash

# MultiSynq MCP Test Runner
# Comprehensive testing script for MultiSynq integration

set -e

echo "🧪 Starting MultiSynq MCP Test Suite"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test functions
run_unit_tests() {
    echo -e "${BLUE}📋 Running Unit Tests...${NC}"
    npm run test:multisynq
}

run_integration_tests() {
    echo -e "${BLUE}🔗 Running Integration Tests...${NC}"
    npm run test:run -- src/lib/multisynq/__tests__/integration.test.ts
}

run_coverage_tests() {
    echo -e "${BLUE}📊 Running Coverage Tests...${NC}"
    npm run test:coverage
}

check_docker_build() {
    echo -e "${BLUE}🐳 Testing Docker Build...${NC}"
    if docker build -t metamcp-multisynq-test .; then
        echo -e "${GREEN}✅ Docker build successful${NC}"
        docker rmi metamcp-multisynq-test
    else
        echo -e "${RED}❌ Docker build failed${NC}"
        exit 1
    fi
}

validate_config() {
    echo -e "${BLUE}⚙️  Validating Configuration...${NC}"
    npm run test:run -- src/lib/multisynq/__tests__/config.test.ts
}

test_inspector_integration() {
    echo -e "${BLUE}🔍 Testing Inspector Integration...${NC}"
    npm run test:run -- src/lib/multisynq/__tests__/inspector.test.ts
}

# Main test execution
main() {
    echo -e "${YELLOW}Starting comprehensive test suite...${NC}"
    
    # Change to backend directory
    cd "$(dirname "$0")"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing dependencies...${NC}"
        npm install
    fi
    
    # Run all test categories
    validate_config
    run_unit_tests
    test_inspector_integration
    run_integration_tests
    run_coverage_tests
    
    # Docker build test (optional)
    read -p "🐳 Test Docker build? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd ../..
        check_docker_build
        cd apps/backend
    fi
    
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
    echo "======================================"
    echo -e "${GREEN}✅ MultiSynq MCP integration is ready for deployment${NC}"
}

# Help function
show_help() {
    echo "MultiSynq MCP Test Runner"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -u, --unit     Run only unit tests"
    echo "  -i, --integration  Run only integration tests"
    echo "  -c, --coverage Run only coverage tests"
    echo "  -d, --docker   Test Docker build only"
    echo ""
    echo "Examples:"
    echo "  $0              # Run all tests"
    echo "  $0 -u           # Run only unit tests"
    echo "  $0 -c           # Run only coverage tests"
}

# Parse command line arguments
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -u|--unit)
        validate_config
        run_unit_tests
        ;;
    -i|--integration)
        run_integration_tests
        ;;
    -c|--coverage)
        run_coverage_tests
        ;;
    -d|--docker)
        cd ../..
        check_docker_build
        ;;
    "")
        main
        ;;
    *)
        echo -e "${RED}❌ Unknown option: $1${NC}"
        show_help
        exit 1
        ;;
esac
