export function createMockLogger() {
  return {
    setContext: jest.fn(),
    setTraceId: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  } as any;
}
