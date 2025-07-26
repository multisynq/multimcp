#!/usr/bin/env node

/**
 * MultiSynq MCP Validation Script
 * Validates that all components are properly configured for root endpoint access
 */

import fs from 'fs';
import path from 'path';

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}🔍 MultiSynq MCP Configuration Validation${RESET}`);
console.log('==========================================');

let validationErrors = 0;

function validateFile(filePath, checks) {
    console.log(`\n📁 Validating: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.log(`${RED}❌ File not found: ${filePath}${RESET}`);
        validationErrors++;
        return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    checks.forEach(check => {
        if (check.type === 'contains') {
            if (content.includes(check.value)) {
                console.log(`${GREEN}✅ ${check.description}${RESET}`);
            } else {
                console.log(`${RED}❌ ${check.description}${RESET}`);
                console.log(`   Expected: ${check.value}`);
                validationErrors++;
            }
        } else if (check.type === 'not_contains') {
            if (!content.includes(check.value)) {
                console.log(`${GREEN}✅ ${check.description}${RESET}`);
            } else {
                console.log(`${RED}❌ ${check.description}${RESET}`);
                console.log(`   Should not contain: ${check.value}`);
                validationErrors++;
            }
        }
    });
}

// Validation checks
const validations = [
    {
        file: 'src/lib/multisynq/config.ts',
        checks: [
            {
                type: 'contains',
                value: 'name: "root"',
                description: 'Namespace configured as "root"'
            },
            {
                type: 'contains',
                value: 'name: "root"',
                description: 'Endpoint configured as "root"'
            },
            {
                type: 'contains',
                value: 'CONTEXT7_LIBRARY_ID: "/multisynq/docs"',
                description: 'Context7 library ID pre-configured'
            },
            {
                type: 'not_contains',
                value: 'CONTEXT7_API_KEY',
                description: 'No Context7 API key dependency'
            }
        ]
    },
    {
        file: 'src/lib/multisynq/init.ts',
        checks: [
            {
                type: 'contains',
                value: 'root endpoint',
                description: 'Initialization creates root endpoint'
            },
            {
                type: 'contains',
                value: 'enable_api_key_auth: false',
                description: 'Public endpoint (no auth required)'
            },
            {
                type: 'contains',
                value: '/sse',
                description: 'Correct SSE endpoint path'
            }
        ]
    },
    {
        file: 'Dockerfile',
        checks: [
            {
                type: 'contains',
                value: '@upstash/context7-mcp',
                description: 'Context7 MCP server installed'
            }
        ]
    },
    {
        file: 'package.json',
        checks: [
            {
                type: 'contains',
                value: '"test:multisynq"',
                description: 'MultiSynq test script configured'
            },
            {
                type: 'contains',
                value: '"vitest"',
                description: 'Vitest dependency added'
            }
        ]
    }
];

// Run validations
validations.forEach(validation => {
    const fullPath = path.join(process.cwd(), validation.file);
    validateFile(fullPath, validation.checks);
});

// Check test files
const testFiles = [
    'src/lib/multisynq/__tests__/config.test.ts',
    'src/lib/multisynq/__tests__/init.test.ts',
    'src/lib/multisynq/__tests__/integration.test.ts',
    'src/lib/multisynq/__tests__/inspector.test.ts'
];

console.log(`\n📋 Test Files Validation`);
testFiles.forEach(testFile => {
    const fullPath = path.join(process.cwd(), testFile);
    if (fs.existsSync(fullPath)) {
        console.log(`${GREEN}✅ ${testFile}${RESET}`);
    } else {
        console.log(`${RED}❌ ${testFile}${RESET}`);
        validationErrors++;
    }
});

// Final validation result
console.log('\n==========================================');
if (validationErrors === 0) {
    console.log(`${GREEN}🎉 All validations passed!${RESET}`);
    console.log(`${GREEN}✅ MultiSynq MCP integration is properly configured for root endpoint access${RESET}`);
    console.log(`\n${BLUE}Next steps:${RESET}`);
    console.log('1. Run: npm run test:multisynq');
    console.log('2. Build: docker compose up -d');
    console.log('3. Test endpoint: https://mcp.multisynq.io/sse');
    process.exit(0);
} else {
    console.log(`${RED}❌ ${validationErrors} validation error(s) found${RESET}`);
    console.log(`${YELLOW}Please fix the issues above before proceeding${RESET}`);
    process.exit(1);
}
