#!/usr/bin/env node

/**
 * Script to fix the MultiSynq MCP server configuration in the database
 * Updates the args from @context7/mcp-server to @upstash/context7-mcp
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

async function fixMultisynqConfig() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('🔧 Fixing MultiSynq MCP server configuration...');
    
    // Update the args in the mcp_servers table
    const result = await pool.query(`
      UPDATE mcp_servers 
      SET args = ARRAY['@upstash/context7-mcp']
      WHERE name = 'MultiSynq-Docs' 
      AND args = ARRAY['@context7/mcp-server']
      RETURNING *;
    `);

    if (result.rowCount > 0) {
      console.log('✅ Updated MultiSynq MCP server configuration');
      console.log(`   Changed args from @context7/mcp-server to @upstash/context7-mcp`);
    } else {
      console.log('ℹ️  No updates needed - configuration already correct');
    }

    // Verify the current configuration
    const verify = await pool.query(`
      SELECT name, args 
      FROM mcp_servers 
      WHERE name = 'MultiSynq-Docs';
    `);

    if (verify.rows.length > 0) {
      console.log('📋 Current configuration:');
      console.log(`   Name: ${verify.rows[0].name}`);
      console.log(`   Args: ${JSON.stringify(verify.rows[0].args)}`);
    }

  } catch (error) {
    console.error('❌ Error updating configuration:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixMultisynqConfig().catch(console.error); 