import { CustomLogger } from '../../src/shared/logger/custom-logger.service';

export const createMockLogger = () => ({
  setContext: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
  audit: jest.fn(),
  security: jest.fn(),
  performance: jest.fn(),
  business: jest.fn(),
});

export const mockLoggerProvider = {
  provide: CustomLogger,
  useValue: createMockLogger(),
};
