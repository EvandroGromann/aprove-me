import { SimpleLoggingInterceptor } from '../../../../src/shared/logger/simple-logging.interceptor';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('SimpleLoggingInterceptor', () => {
  const createContext = (): ExecutionContext => ({
    switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) }),
    getClass: jest.fn(() => ({ name: 'TestController' })),
    getHandler: jest.fn(() => ({ name: 'testHandler' })),
  } as unknown as ExecutionContext);

  const createNext = (value: any = { ok: true }): CallHandler => ({
    handle: () => of(value),
  });

  it('sets context to controller name and logs handler name once', (done) => {
    const logger = { setContext: jest.fn(), info: jest.fn() } as any as CustomLogger;
    const interceptor = new SimpleLoggingInterceptor(logger);

    const ctx = createContext();
    const next = createNext();

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        expect(logger.setContext).toHaveBeenCalledWith('TestController');
        expect(logger.info).toHaveBeenCalledWith('testHandler', 'TestController');
        // only input log once; tap does not log output
        expect((logger.info as jest.Mock).mock.calls.length).toBe(1);
        done();
      },
      error: done,
    });
  });

  it('executes tap callback on emission (no extra logs)', (done) => {
    const logger = { setContext: jest.fn(), info: jest.fn() } as any as CustomLogger;
    const interceptor = new SimpleLoggingInterceptor(logger);

    const ctx = createContext();
    const next = createNext([1, 2, 3]);

    interceptor.intercept(ctx, next).subscribe({
      next: () => {
        // tap ran on emission; assert no additional info calls beyond the first
        expect(logger.setContext).toHaveBeenCalledWith('TestController');
        expect(logger.info).toHaveBeenCalledTimes(1);
        done();
      },
      error: done,
    });
  });
});
