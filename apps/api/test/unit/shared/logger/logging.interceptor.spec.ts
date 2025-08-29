import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of, throwError } from 'rxjs';
import { LoggingInterceptor } from '../../../../src/shared/logger/logging.interceptor';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { createMockLogger } from '../../../helpers/logger.helper';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: any;

  beforeEach(async () => {
    logger = createMockLogger();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: CustomLogger,
          useValue: logger,
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (
    method = 'GET',
    url = '/test',
    ip = '127.0.0.1',
    userAgent = 'test-agent',
    user?: any
  ): ExecutionContext => {
    const request = {
      method,
      url,
      ip,
      headers: { 'user-agent': userAgent },
      user,
    };
    
    const response = {
      statusCode: 200,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;
  };

  const createMockCallHandler = (data?: any): CallHandler => ({
    handle: () => (data ? of(data) : of({ success: true })),
  });

  describe('intercept', () => {
    it('should log incoming request', () => {
      const context = createMockExecutionContext();
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe();

      expect(logger.log).toHaveBeenCalledWith(
        'Incoming GET /test',
        'HTTP',
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          ip: '127.0.0.1',
          userAgent: 'test-agent',
          userId: undefined,
          requestId: expect.any(String),
        })
      );
    });

    it('should log request with user information', () => {
      const user = { id: 123, sub: 456 };
      const context = createMockExecutionContext('POST', '/users', '192.168.1.1', 'browser', user);
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe();

      expect(logger.log).toHaveBeenCalledWith(
        'Incoming POST /users',
        'HTTP',
        expect.objectContaining({
          method: 'POST',
          url: '/users',
          userId: 123,
        })
      );
    });

    it('should log performance metrics on success', (done) => {
      const context = createMockExecutionContext();
      const responseData = { id: 1, name: 'test' };
      const next = createMockCallHandler(responseData);

      interceptor.intercept(context, next).subscribe({
        complete: () => {
          expect(logger.performance).toHaveBeenCalledWith(
            'GET /test',
            expect.any(Number),
            expect.objectContaining({
              statusCode: 200,
              responseSize: JSON.stringify(responseData).length,
              userId: undefined,
            })
          );
          done();
        }
      });
    });

    it('should log business events for business operations', (done) => {
      const context = createMockExecutionContext('POST', '/payables');
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe({
        complete: () => {
          expect(logger.business).toHaveBeenCalledWith(
            'POST /payables completed',
            expect.objectContaining({
              statusCode: 200,
              duration: expect.any(Number),
              userId: undefined,
              endpoint: '/payables',
            })
          );
          done();
        }
      });
    });

    it('should not log business events for non-business operations', (done) => {
      const context = createMockExecutionContext('GET', '/health');
      const next = createMockCallHandler();

      interceptor.intercept(context, next).subscribe({
        complete: () => {
          expect(logger.business).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should log errors', (done) => {
      const context = createMockExecutionContext();
      const error = new Error('Test error');
      error.name = 'TestError';
      (error as any).status = 500;

      const next: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, next).subscribe({
        error: (err) => {
          expect(logger.error).toHaveBeenCalledWith(
            'GET /test failed',
            error.stack,
            'HTTP',
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              statusCode: 500,
              duration: expect.any(Number),
              userId: undefined,
              errorMessage: 'Test error',
              errorName: 'TestError',
            })
          );
          done();
        }
      });
    });

    it('should log errors without status (default to 500)', (done) => {
      const context = createMockExecutionContext();
      const error = new Error('Error without status');
      error.name = 'GenericError';
      // No status property set

      const next: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, next).subscribe({
        error: (err) => {
          expect(logger.error).toHaveBeenCalledWith(
            'GET /test failed',
            error.stack,
            'HTTP',
            expect.objectContaining({
              statusCode: 500, // Should default to 500
              errorMessage: 'Error without status',
              errorName: 'GenericError',
            })
          );
          done();
        }
      });
    });

    it('should log security events for authentication failures', (done) => {
      const context = createMockExecutionContext();
      const error = new Error('Unauthorized');
      (error as any).status = 401;

      const next: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, next).subscribe({
        error: () => {
          expect(logger.security).toHaveBeenCalledWith(
            'Authentication/Authorization failure',
            expect.objectContaining({
              method: 'GET',
              url: '/test',
              ip: '127.0.0.1',
              userAgent: 'test-agent',
              userId: undefined,
              errorStatus: 401,
              errorMessage: 'Unauthorized',
            })
          );
          done();
        }
      });
    });

    it('should log security events for authorization failures', (done) => {
      const context = createMockExecutionContext();
      const error = new Error('Forbidden');
      (error as any).status = 403;

      const next: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, next).subscribe({
        error: () => {
          expect(logger.security).toHaveBeenCalledWith(
            'Authentication/Authorization failure',
            expect.objectContaining({
              errorStatus: 403,
              errorMessage: 'Forbidden',
            })
          );
          done();
        }
      });
    });

    it('should not log security events for non-security errors', (done) => {
      const context = createMockExecutionContext();
      const error = new Error('Internal error');
      (error as any).status = 500;

      const next: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, next).subscribe({
        error: () => {
          expect(logger.security).not.toHaveBeenCalled();
          done();
        }
      });
    });

    it('should handle errors with custom error names', (done) => {
      const context = createMockExecutionContext();
      const error = new Error('Custom error message');
      error.name = 'CustomErrorType';
      (error as any).status = 422;

      const next: CallHandler = {
        handle: () => throwError(() => error),
      };

      interceptor.intercept(context, next).subscribe({
        error: (err) => {
          expect(logger.error).toHaveBeenCalledWith(
            'GET /test failed',
            error.stack,
            'HTTP',
            expect.objectContaining({
              statusCode: 422,
              errorMessage: 'Custom error message',
              errorName: 'CustomErrorType',
            })
          );
          done();
        }
      });
    });
  });

  describe('isBusinessOperation', () => {
    it('should identify business operations correctly', () => {
      const businessTests = [
        { method: 'POST', url: '/payables', expected: true },
        { method: 'PUT', url: '/assignors/123', expected: true },
        { method: 'DELETE', url: '/users/456', expected: true },
        { method: 'POST', url: '/auth/login', expected: true },
        { method: 'GET', url: '/payables', expected: false },
        { method: 'POST', url: '/health', expected: false },
      ];

      businessTests.forEach(({ method, url, expected }) => {
        const context = createMockExecutionContext(method, url);
        const next = createMockCallHandler();

        interceptor.intercept(context, next).subscribe({
          complete: () => {
            if (expected) {
              expect(logger.business).toHaveBeenCalled();
            } else {
              expect(logger.business).not.toHaveBeenCalled();
            }
            jest.clearAllMocks();
          }
        });
      });
    });
  });
});
