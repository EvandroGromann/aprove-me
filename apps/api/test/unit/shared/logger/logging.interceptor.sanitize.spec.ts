import { LoggingInterceptor } from '../../../../src/shared/logger/logging.interceptor';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';

describe('LoggingInterceptor.sanitizeData (private)', () => {
  it('returns non-objects as-is and masks known sensitive fields in objects', () => {
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), setContext: jest.fn() } as any as CustomLogger;
    const interceptor = new LoggingInterceptor(logger);

    // non-object
    expect((interceptor as any).sanitizeData(undefined)).toBeUndefined();
    expect((interceptor as any).sanitizeData(1)).toBe(1);

    // object with sensitive fields
  const obj = { a: 1, password: 'x', authorization: 'Bearer token', nested: { key: 'y' } };
    const result = (interceptor as any).sanitizeData(obj);
    expect(result.password).toBe('***');
    expect(result.authorization).toBe('***');
  // comportamento atual: não é recursivo; campos aninhados permanecem
  expect(result.nested.key).toBe('y');
  });
});
