import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    endpointsRepository,
    mcpServersRepository,
    namespacesRepository
} from '../../../db/repositories';
import {
    MULTISYNQ_ENDPOINT_CONFIG,
    MULTISYNQ_NAMESPACE_CONFIG,
    MULTISYNQ_SERVER_CONFIG
} from '../config';
import { initializeMultiSynqEndpoint } from '../init';

// Mock the repositories
vi.mock('../../../db/repositories', () => ({
  mcpServersRepository: {
    findByName: vi.fn(),
    create: vi.fn(),
  },
  namespacesRepository: {
    findByNameAndUserId: vi.fn(),
    create: vi.fn(),
  },
  endpointsRepository: {
    findByName: vi.fn(),
    create: vi.fn(),
  },
}));

describe('MultiSynq Initialization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Silence console.log during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializeMultiSynqEndpoint', () => {
    it('should create new server, namespace, and endpoint when none exist', async () => {
      // Arrange
      const mockServer = { uuid: 'server-123', name: MULTISYNQ_SERVER_CONFIG.name };
      const mockNamespace = { uuid: 'namespace-123', name: MULTISYNQ_NAMESPACE_CONFIG.name };
      const mockEndpoint = { uuid: 'endpoint-123', name: MULTISYNQ_ENDPOINT_CONFIG.name };

      vi.mocked(mcpServersRepository.findByName).mockResolvedValue(undefined);
      vi.mocked(namespacesRepository.findByNameAndUserId).mockResolvedValue(undefined);
      vi.mocked(endpointsRepository.findByName).mockResolvedValue(undefined);

      vi.mocked(mcpServersRepository.create).mockResolvedValue(mockServer as any);
      vi.mocked(namespacesRepository.create).mockResolvedValue(mockNamespace as any);
      vi.mocked(endpointsRepository.create).mockResolvedValue(mockEndpoint as any);

      // Act
      const result = await initializeMultiSynqEndpoint();

      // Assert
      expect(mcpServersRepository.create).toHaveBeenCalledWith({
        name: MULTISYNQ_SERVER_CONFIG.name,
        description: MULTISYNQ_SERVER_CONFIG.description,
        type: 'STDIO',
        command: 'npx',
        args: ['@upstash/context7-mcp'],
        env: { CONTEXT7_LIBRARY_ID: '/multisynq/docs' },
        user_id: null
      });

      expect(namespacesRepository.create).toHaveBeenCalledWith({
        name: MULTISYNQ_NAMESPACE_CONFIG.name,
        description: MULTISYNQ_NAMESPACE_CONFIG.description,
        mcpServerUuids: ['server-123'],
        user_id: null
      });

      expect(endpointsRepository.create).toHaveBeenCalledWith({
        name: MULTISYNQ_ENDPOINT_CONFIG.name,
        description: MULTISYNQ_ENDPOINT_CONFIG.description,
        namespace_uuid: 'namespace-123',
        enable_api_key_auth: false,
        use_query_param_auth: false,
        user_id: null
      });

      expect(result).toEqual({
        mcpServer: mockServer,
        namespace: mockNamespace,
        endpoint: mockEndpoint
      });
    });

    it('should use existing resources when they already exist', async () => {
      // Arrange
      const mockServer = { uuid: 'existing-server-123', name: MULTISYNQ_SERVER_CONFIG.name };
      const mockNamespace = { uuid: 'existing-namespace-123', name: MULTISYNQ_NAMESPACE_CONFIG.name };
      const mockEndpoint = { uuid: 'existing-endpoint-123', name: MULTISYNQ_ENDPOINT_CONFIG.name };

      vi.mocked(mcpServersRepository.findByName).mockResolvedValue(mockServer as any);
      vi.mocked(namespacesRepository.findByNameAndUserId).mockResolvedValue(mockNamespace as any);
      vi.mocked(endpointsRepository.findByName).mockResolvedValue(mockEndpoint as any);

      // Act
      const result = await initializeMultiSynqEndpoint();

      // Assert
      expect(mcpServersRepository.create).not.toHaveBeenCalled();
      expect(namespacesRepository.create).not.toHaveBeenCalled();
      expect(endpointsRepository.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        mcpServer: mockServer,
        namespace: mockNamespace,
        endpoint: mockEndpoint
      });
    });

    it('should handle errors gracefully without throwing', async () => {
      // Arrange
      vi.mocked(mcpServersRepository.findByName).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await initializeMultiSynqEndpoint();

      // Assert
      expect(result).toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "❌ Failed to initialize MultiSynq root endpoint:",
        expect.any(Error)
      );
    });

    it('should create endpoint with correct configuration for root access', async () => {
      // Arrange
      vi.mocked(mcpServersRepository.findByName).mockResolvedValue(undefined);
      vi.mocked(namespacesRepository.findByNameAndUserId).mockResolvedValue(undefined);
      vi.mocked(endpointsRepository.findByName).mockResolvedValue(undefined);

      vi.mocked(mcpServersRepository.create).mockResolvedValue({ uuid: 'server-123' } as any);
      vi.mocked(namespacesRepository.create).mockResolvedValue({ uuid: 'namespace-123' } as any);
      vi.mocked(endpointsRepository.create).mockResolvedValue({ uuid: 'endpoint-123' } as any);

      // Act
      await initializeMultiSynqEndpoint();

      // Assert - Verify root endpoint configuration
      expect(endpointsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'root',
          enable_api_key_auth: false,
          use_query_param_auth: false,
          user_id: null
        })
      );
    });
  });
});
