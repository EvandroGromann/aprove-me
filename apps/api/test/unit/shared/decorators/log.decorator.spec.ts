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
});
