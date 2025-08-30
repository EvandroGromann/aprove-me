import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { Logger } from 'winston';

describe('CustomLogger (minimal)', () => {
  let logger: CustomLogger;
  let winstonLogger: jest.Mocked<Logger>;

  const mockWinstonLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomLogger,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockWinstonLogger,
        },
      ],
    }).compile();

    logger = module.get<CustomLogger>(CustomLogger);
    winstonLogger = module.get(WINSTON_MODULE_PROVIDER) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call winston.info via log/info', () => {
    logger.log('Test info message', 'TestContext');
    expect(winstonLogger.info).toHaveBeenCalledWith('Test info message', expect.objectContaining({ context: 'TestContext' }));

    logger.info('Direct info', 'Ctx');
    expect(winstonLogger.info).toHaveBeenCalledWith('Direct info', expect.objectContaining({ context: 'Ctx' }));
  });

  it('should call winston.warn via warn', () => {
    logger.warn('Warn message', 'WarnCtx');
    expect(winstonLogger.warn).toHaveBeenCalledWith('Warn message', expect.objectContaining({ context: 'WarnCtx' }));
  });

  it('should call winston.error via error', () => {
    logger.error('Error message', 'trace', 'ErrCtx');
    expect(winstonLogger.error).toHaveBeenCalledWith('Error message', expect.objectContaining({ context: 'ErrCtx', trace: 'trace' }));
  });

  it('should call winston.error with Error overload including stack and errorName', () => {
    logger.setContext('ErrCtx2');
    const err = new TypeError('Boom');
    logger.error(err, 'ErrCtx2');
    expect(winstonLogger.error).toHaveBeenCalled();
    const [message, meta] = (winstonLogger.error as jest.Mock).mock.calls.pop();
    expect(message).toBe('Boom');
    expect(meta.errorName).toBe('TypeError');
    expect(meta.context).toBe('ErrCtx2');
    expect(typeof meta.trace).toBe('string');
  });
});
