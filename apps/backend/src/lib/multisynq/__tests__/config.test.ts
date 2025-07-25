import { describe, it, expect } from 'vitest';
import { 
  MULTISYNQ_MCP_CONFIG,
  MULTISYNQ_SERVER_CONFIG,
  MULTISYNQ_NAMESPACE_CONFIG,
  MULTISYNQ_ENDPOINT_CONFIG
} from '../config';

describe('MultiSynq Configuration', () => {
  describe('MULTISYNQ_MCP_CONFIG', () => {
    it('should have correct MCP server configuration', () => {
      expect(MULTISYNQ_MCP_CONFIG).toEqual({
        type: 'STDIO',
        command: 'npx',
        args: ['@context7/mcp-server'],
        env: {
          CONTEXT7_LIBRARY_ID: '/multisynq/docs'
        }
      });
    });

    it('should use Context7 MCP server with MultiSynq library pre-configured', () => {
      expect(MULTISYNQ_MCP_CONFIG.args).toContain('@context7/mcp-server');
      expect(MULTISYNQ_MCP_CONFIG.env.CONTEXT7_LIBRARY_ID).toBe('/multisynq/docs');
    });

    it('should not require external API keys', () => {
      expect(MULTISYNQ_MCP_CONFIG.env).not.toHaveProperty('CONTEXT7_API_KEY');
    });
  });

  describe('MULTISYNQ_SERVER_CONFIG', () => {
    it('should have descriptive name and description', () => {
      expect(MULTISYNQ_SERVER_CONFIG.name).toBe('MultiSynq-Docs');
      expect(MULTISYNQ_SERVER_CONFIG.description).toContain('MultiSynq Documentation');
      expect(MULTISYNQ_SERVER_CONFIG.description).toContain('Context7');
    });

    it('should be marked as a system server', () => {
      expect(MULTISYNQ_SERVER_CONFIG.isSystem).toBe(true);
    });
  });

  describe('MULTISYNQ_NAMESPACE_CONFIG', () => {
    it('should be configured as root namespace', () => {
      expect(MULTISYNQ_NAMESPACE_CONFIG.name).toBe('root');
      expect(MULTISYNQ_NAMESPACE_CONFIG.description).toContain('Root Endpoint');
    });

    it('should be marked as system namespace', () => {
      expect(MULTISYNQ_NAMESPACE_CONFIG.isSystem).toBe(true);
    });
  });

  describe('MULTISYNQ_ENDPOINT_CONFIG', () => {
    it('should be configured as root endpoint for direct access', () => {
      expect(MULTISYNQ_ENDPOINT_CONFIG.name).toBe('root');
      expect(MULTISYNQ_ENDPOINT_CONFIG.description).toContain('Root endpoint');
    });

    it('should be public with no authentication required', () => {
      expect(MULTISYNQ_ENDPOINT_CONFIG.authLevel).toBe('PUBLIC');
    });

    it('should be marked as system endpoint', () => {
      expect(MULTISYNQ_ENDPOINT_CONFIG.isSystem).toBe(true);
    });
  });
});
