import { CustomLogger } from '../../src/shared/logger/custom-logger.service';

export const createMockLogger = () => ({
  setContext: jest.fn(),
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
});

export const mockLoggerProvider = {
  provide: CustomLogger,
  useValue: createMockLogger(),
};
