import { Log } from '../../../../src/shared/decorators/log.decorator';

class TestService {
  @Log()
  syncMethod(a: number) {
    return a + 1;
  }

  @Log()
  async asyncMethod(a: number) {
    return a + 2;
  }

  @Log()
  throws() {
    throw new Error('boom');
  }

  @Log('customMessage')
  withStringOption(v: any) {
    return { ok: v };
  }

  @Log({ message: 'full', input: true, output: true, duration: true })
  withOptions(dto: any) {
    return { out: dto };
  }

  @Log()
  withArray(arr: any[]) {
    return arr.length;
  }

  @Log({ input: true, output: true })
  withComplex(obj: any) {
    return { nested: obj };
  }

  @Log({ output: true })
  outputOnlyPrimitive() {
    return 42;
  }

  @Log({ output: true })
  outputOnlyObject() {
    return { ok: true };
  }

  @Log({ output: true, duration: true })
  outputPrimitiveWithDuration() {
    return 7;
  }

  @Log({ output: true, duration: true })
  outputObjectWithDuration() {
    return { foo: 'bar' };
  }

  @Log({ output: true })
  outputArrayOnly() {
    return [1, { password: 's3cr3t', nested: { token: 'abc' } }];
  }

  @Log({ output: true })
  outputNullProtoObject() {
    const o = Object.create(null);
    o.ok = true;
    o.token = 'xyz';
    return o;
  }

  @Log()
  noArgsMethod() {
    return 'done';
  }

  @Log({ input: false, output: false })
  noInputNoOutput(a?: any) {
    return a ?? 'x';
  }

  @Log({ output: true })
  outputNull() {
    return null as any;
  }

  @Log()
  withNoCtor(obj: any) {
    return obj;
  }
}

describe('Log decorator', () => {
  it('does not break sync/async methods and handles errors', async () => {
    const svc = new TestService();
    // avoid fallback winston file writes by providing a mock logger instance
    (svc as any).logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
  await expect(svc.syncMethod(1)).resolves.toBe(2);
  await expect(svc.asyncMethod(1)).resolves.toBe(3);
  await expect(svc.throws()).rejects.toThrow();
  });

  it('handles string option and full options with DTO-like arg', async () => {
    const svc = new TestService();
    (svc as any).logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;

    class SampleDTO {}
    const dto = new SampleDTO();

    await expect(svc.withStringOption('x')).resolves.toEqual({ ok: 'x' });
    await expect(svc.withOptions(dto)).resolves.toEqual({ out: dto });
  });

  it('sanitizes arrays and complex nested structures (covers internal sanitizer branches)', async () => {
    const svc = new TestService();
    (svc as any).logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;

    await expect(svc.withArray([1, { password: 'p' }])).resolves.toBe(2);
    const input = { a: null, items: [1, { token: 't' }] };
    await expect(svc.withComplex(input)).resolves.toEqual({ nested: input });
  });

  it('logs output without duration and wraps primitive result into { value }', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const r = await svc.outputOnlyPrimitive();
    expect(r).toBe(42);

    // Deve logar "output:" e incluir { value: 42 }
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('output:'), expect.objectContaining({ value: 42 }));
  });

  it('logs output without duration for object result (spreads object)', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const r = await svc.outputOnlyObject();
    expect(r).toEqual({ ok: true });
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('output:'), expect.objectContaining({ ok: true }));
  });

  it('logs output with duration for primitive result (wraps into { value })', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const r = await svc.outputPrimitiveWithDuration();
    expect(r).toBe(7);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('output:'),
      expect.objectContaining({ value: 7 })
    );
  });

  it('logs output with duration for object result (spreads object)', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const r = await svc.outputObjectWithDuration();
    expect(r).toEqual({ foo: 'bar' });
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('output:'),
      expect.objectContaining({ foo: 'bar' })
    );
  });

  it('logs output for array result, wrapping under { value } and sanitizing nested sensitive fields', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const r = await svc.outputArrayOnly();
    expect(Array.isArray(r)).toBe(true);
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('output:'),
      expect.objectContaining({
        value: expect.arrayContaining([
          1,
          expect.objectContaining({ password: '***', nested: expect.objectContaining({ token: '***' }) })
        ])
      })
    );
  });

  it('logs output for null-prototype plain object by spreading its keys (proto === null case)', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const r = await svc.outputNullProtoObject();
    expect(r.ok).toBe(true);
    // token is sensitive and must be masked; object should be spread, not wrapped
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('output:'),
      expect.objectContaining({ ok: true, token: '***' })
    );
  });

  it('handles method without args and still logs input block', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    await expect(svc.noArgsMethod()).resolves.toBe('done');
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('input:'), expect.any(Object));
  });

  it('respects input:false (no input log) and output:false (no output log)', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    await expect(svc.noInputNoOutput(7)).resolves.toBe(7);
    // nenhuma chamada de info
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('logs output with null result, exercising sanitizer early return', async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const r = await svc.outputNull();
    expect(r).toBeNull();
    // deve logar output com { value: null }
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('output:'), expect.objectContaining({ value: null }));
  });

  it("covers dtoName fallback to 'params' when constructor name is missing (Object.create(null))", async () => {
    const svc = new TestService();
    const logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as any;
    (svc as any).logger = logger;

    const arg = Object.create(null);
    arg.password = 'secret';

    await expect(svc.withNoCtor(arg)).resolves.toBe(arg);

    // Deve cair no ramo params.data e sanitizar o campo sensível
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining('input:'),
      expect.objectContaining({ data: expect.objectContaining({ password: '***' }) })
    );
  });

  it('uses fallback logger when no instance logger is provided (input path)', async () => {
    const svc = new TestService();
    // não atribuir svc.logger => cai no fallbackLogger
    await expect(svc.syncMethod(5)).resolves.toBe(6);
  });

  it('uses fallback logger for output path when enabled', async () => {
    const svc = new TestService();
    // sem logger => fallback
    const r = await svc.outputOnlyPrimitive();
    expect(r).toBe(42);
  });

  it('uses fallback logger on error catch branch', async () => {
    const svc = new TestService();
    // sem logger => fallback
    await expect(svc.throws()).rejects.toThrow('boom');
  });
});
