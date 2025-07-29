
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function updateMcpServerConfig() {
  try {
    const result = await pool.query(
      "UPDATE mcp_servers SET args = array_replace(args, '@context7/mcp-server', '@upstash/context7-mcp') WHERE '@context7/mcp-server' = ANY(args)"
    );
    console.log('Updated MCP server configurations:', result.rowCount);
  } catch (error) {
    console.error('Error updating MCP server configurations:', error);
  } finally {
    await pool.end();
  }
}

updateMcpServerConfig();
