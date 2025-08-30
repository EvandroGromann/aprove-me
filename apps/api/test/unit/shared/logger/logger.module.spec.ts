import { Test, TestingModule } from '@nestjs/testing';
import { WinstonModule } from 'nest-winston';
import { LoggerModule } from '../../../../src/shared/logger/logger.module';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { LoggingInterceptor } from '../../../../src/shared/logger/logging.interceptor';

// Mock the winston logger to avoid file system operations during tests
jest.mock('../../../../src/shared/logger/logger.config', () => ({
  loggerConfig: {
    level: 'info',
    format: {},
    defaultMeta: { service: 'test' },
    transports: [],
    exceptionHandlers: [],
    rejectionHandlers: []
  }
}));

describe('LoggerModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [require('../../../../src/shared/logger/logger.module').LoggerModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide CustomLogger', () => {
    const logger = module.get<CustomLogger>(CustomLogger);
    expect(logger).toBeDefined();
    expect(logger).toBeInstanceOf(CustomLogger);
  });

  // Note: LoggerModule does not register LoggingInterceptor as a provider.
  // That interceptor is typically bound at the application level. Do not
  // assert its presence here to keep the test aligned with the module's
  // actual exported providers.

  it('should export WinstonModule', () => {
    // WinstonModule should be available for injection
    expect(() => module.get(WinstonModule)).not.toThrow();
  });
});
