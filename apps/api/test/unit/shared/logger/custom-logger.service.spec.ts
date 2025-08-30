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

  it('supports info/warn metadata overloads without explicit context', () => {
    logger.info('m1', { a: 1 });
    expect(winstonLogger.info).toHaveBeenCalledWith('m1', expect.objectContaining({ a: 1 }));

    logger.warn('m2', { b: 2 });
    expect(winstonLogger.warn).toHaveBeenCalledWith('m2', expect.objectContaining({ b: 2 }));
  });

  it('exposes helpers: flow, operation, performance, audit, security, business', () => {
    logger.setContext('Ctx');

    logger.flow('step-1', { x: 1 });
    expect(winstonLogger.info).toHaveBeenCalledWith('step-1', expect.objectContaining({ x: 1, context: 'Ctx' }));

    logger.operation('op', 123, true, { extra: 9 });
    expect(winstonLogger.info).toHaveBeenCalledWith('op completed (123ms)', expect.objectContaining({ duration: 123, success: true, extra: 9 }));

    logger.performance('perf', 10, { det: 'a' });
    expect(winstonLogger.info).toHaveBeenCalledWith('perf', expect.objectContaining({ duration: 10, det: 'a' }));

    logger.audit('user.login', { id: 7 });
    expect(winstonLogger.info).toHaveBeenCalledWith('user.login', expect.objectContaining({ type: 'audit', id: 7 }));

    logger.security('deny', { ip: '1.1.1.1' });
    expect(winstonLogger.warn).toHaveBeenCalledWith('deny', expect.objectContaining({ type: 'security', ip: '1.1.1.1' }));

    logger.business('sale', { price: 10 });
    expect(winstonLogger.info).toHaveBeenCalledWith('sale', expect.objectContaining({ business: true, price: 10 }));
  });

  it('operation logs failed branch when success=false and merges provided data', () => {
    logger.setContext('OpCtx');
    logger.operation('payment', 45, false);
    expect(winstonLogger.info).toHaveBeenCalledWith(
      'payment failed (45ms)',
      expect.objectContaining({ duration: 45, success: false, context: 'OpCtx' })
    );
  });

  it('operation uses default success=true when omitted and falls back to instance context', () => {
    logger.setContext('OpDef');
    // omit the success argument to trigger default parameter
    logger.operation('upload', 12);
    expect(winstonLogger.info).toHaveBeenCalledWith(
      'upload completed (12ms)',
      expect.objectContaining({ duration: 12, success: true, context: 'OpDef' })
    );
  });

  it('maps debug/verbose to info and injects traceId when available', () => {
    const { RequestContextService } = jest.requireActual('../../../../src/shared/context/request-context.service');
    // Simular traceId estático
    RequestContextService.setTraceId('tid-test');

    logger.debug('dbg', 'CtxDbg', { d: 1 });
    logger.verbose('vrb', 'CtxVrb', { v: 2 });

    expect(winstonLogger.info).toHaveBeenCalledWith('dbg', expect.objectContaining({ context: 'CtxDbg', d: 1, traceId: 'tid-test' }));
    expect(winstonLogger.info).toHaveBeenCalledWith('vrb', expect.objectContaining({ context: 'CtxVrb', v: 2, traceId: 'tid-test' }));
  });

  it('error(Error) overload merges meta and falls back to this.context when context not provided', () => {
    logger.setContext('ErrCtx3');
    const err = new Error('bad');
    logger.error(err as any, undefined as any, { extra: 5 });
    expect(winstonLogger.error).toHaveBeenCalled();
    const [msg, meta] = (winstonLogger.error as jest.Mock).mock.calls.pop();
    expect(msg).toBe('bad');
    expect(meta).toEqual(expect.objectContaining({ context: 'ErrCtx3', errorName: 'Error', extra: 5 }));
  });

  it('error(message, trace, context, metadata) spreads metadata and uses provided context', () => {
    logger.setContext('CtxDefault');
    logger.error('boom', undefined, undefined, { x: 9 });
    expect(winstonLogger.error).toHaveBeenCalledWith('boom', expect.objectContaining({ context: 'CtxDefault', x: 9 }));
  });
});
