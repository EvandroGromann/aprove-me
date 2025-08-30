import { SimpleLoggingInterceptor } from '../../../../src/shared/logger/simple-logging.interceptor';
import { ErrorLoggingInterceptor } from '../../../../src/shared/logger/error-logging.interceptor';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';

describe('Logging interceptors', () => {
  it('SimpleLoggingInterceptor sets context and calls info', () => {
    const fakeW = { info: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const interceptor = new SimpleLoggingInterceptor(logger);

    const ctx: any = {
      getClass: () => ({ name: 'C' }),
      getHandler: () => ({ name: 'h' }),
    };

    const next: any = { handle: () => ({ pipe: () => ({}) }) };
    interceptor.intercept(ctx as any, next);
    expect(fakeW.info).toHaveBeenCalled();
  });

  it('ErrorLoggingInterceptor logs on error path', (done) => {
    const fakeW = { error: jest.fn() } as any;
    const logger = new CustomLogger(fakeW);
    const interceptor = new ErrorLoggingInterceptor(logger);

    const ctx: any = {
      switchToHttp: () => ({ getRequest: () => ({ method: 'GET', url: '/' }) }),
      getHandler: () => ({ name: 'handler' }),
      getClass: () => ({ name: 'Controller' }),
    };

    const { throwError } = require('rxjs');
    const next: any = { handle: () => throwError(() => new Error('boom')) };

    interceptor.intercept(ctx as any, next as any).subscribe({
      error: () => {
        expect(fakeW.error).toHaveBeenCalled();
        done();
      }
    });
  });
});
