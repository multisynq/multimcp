import { vi } from 'vitest';

// Mock database connections for testing
vi.mock('../../db/index', () => ({
  db: {}
}));

// Global test configuration
global.console = {
  ...console,
  // Suppress logs during tests unless explicitly needed
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

// Test environment setup
beforeEach(() => {
  // Reset all mocks between tests
  vi.clearAllMocks();
});
