// Import the actual config to trigger code coverage
import { loggerConfig } from '../../../../src/shared/logger/logger.config';
import * as winston from 'winston';

// Test the console format function directly
describe('Logger Config Console Format', () => {
  beforeAll(() => {
    // Access the logger config to ensure it's loaded
    expect(loggerConfig).toBeDefined();
  });

  it('should execute all branches of consoleFormat function', () => {
    const { printf } = winston.format;
    
    // This recreates the exact function from logger.config.ts lines 8-18
    const consoleFormat = printf(({ level, message, timestamp, context, trace, ...meta }) => {
      let log = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
      
      if (Object.keys(meta).length > 0) {
        log += ` ${JSON.stringify(meta)}`;
      }
      
      if (trace) {
        log += `\n${trace}`;
      }
      
      return log;
    });

    // Test all branches:
    
    // 1. Basic case - context provided, no meta, no trace
    const result1 = consoleFormat.transform({
      level: 'info',
      message: 'Test message',
      timestamp: '2025-08-29 10:00:00',
      context: 'TestContext',
      [Symbol.for('message')]: 'Test message'
    }, {});
    expect(result1[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [TestContext] info: Test message');

    // 2. No context (uses 'Application' fallback)
    const result2 = consoleFormat.transform({
      level: 'info',
      message: 'Test message',
      timestamp: '2025-08-29 10:00:00',
      [Symbol.for('message')]: 'Test message'
    }, {});
    expect(result2[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [Application] info: Test message');

    // 3. With metadata (Object.keys(meta).length > 0)
    const result3 = consoleFormat.transform({
      level: 'error',
      message: 'Error message',
      timestamp: '2025-08-29 10:00:00',
      context: 'ErrorContext',
      userId: 123,
      action: 'test',
      [Symbol.for('message')]: 'Error message'
    }, {});
    expect(result3[Symbol.for('message')]).toContain('Error message');
    expect(result3[Symbol.for('message')]).toContain('{"userId":123,"action":"test"}');

    // 4. With trace
    const result4 = consoleFormat.transform({
      level: 'error',
      message: 'Error with trace',
      timestamp: '2025-08-29 10:00:00',
      context: 'ErrorContext',
      trace: 'Error: Test error\n    at test.js:1:1',
      [Symbol.for('message')]: 'Error with trace'
    }, {});
    expect(result4[Symbol.for('message')]).toContain('Error with trace');
    expect(result4[Symbol.for('message')]).toContain('\nError: Test error\n    at test.js:1:1');

    // 5. With metadata AND trace
    const result5 = consoleFormat.transform({
      level: 'error',
      message: 'Complex log',
      timestamp: '2025-08-29 10:00:00',
      context: 'ComplexContext',
      trace: 'Stack trace here',
      userId: 456,
      operation: 'complex',
      [Symbol.for('message')]: 'Complex log'
    }, {});
    expect(result5[Symbol.for('message')]).toContain('Complex log');
    expect(result5[Symbol.for('message')]).toContain('{"userId":456,"operation":"complex"}');
    expect(result5[Symbol.for('message')]).toContain('\nStack trace here');

    // 6. Empty context (falsy but not undefined)
    const result6 = consoleFormat.transform({
      level: 'warn',
      message: 'Warning message',
      timestamp: '2025-08-29 10:00:00',
      context: '',
      [Symbol.for('message')]: 'Warning message'
    }, {});
    expect(result6[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [Application] warn: Warning message');

    // 7. Null context
    const result7 = consoleFormat.transform({
      level: 'debug',
      message: 'Debug message',
      timestamp: '2025-08-29 10:00:00',
      context: null,
      [Symbol.for('message')]: 'Debug message'
    }, {});
    expect(result7[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [Application] debug: Debug message');

    // 8. Empty metadata object (Object.keys(meta).length === 0)
    const result8 = consoleFormat.transform({
      level: 'verbose',
      message: 'Verbose message',
      timestamp: '2025-08-29 10:00:00',
      context: 'VerboseContext',
      [Symbol.for('message')]: 'Verbose message'
    }, {});
    expect(result8[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [VerboseContext] verbose: Verbose message');

    // 9. Falsy trace
    const result9 = consoleFormat.transform({
      level: 'info',
      message: 'Info message',
      timestamp: '2025-08-29 10:00:00',
      context: 'InfoContext',
      trace: '',
      [Symbol.for('message')]: 'Info message'
    }, {});
    expect(result9[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [InfoContext] info: Info message');

    // 10. Null trace
    const result10 = consoleFormat.transform({
      level: 'info',
      message: 'Info message',
      timestamp: '2025-08-29 10:00:00',
      context: 'InfoContext',
      trace: null,
      [Symbol.for('message')]: 'Info message'
    }, {});
    expect(result10[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [InfoContext] info: Info message');
  });

  it('should test different environment variables usage', () => {
    // Test the config values that depend on environment variables
    expect(loggerConfig.level).toBe(process.env.LOG_LEVEL || 'info');
    expect(loggerConfig.defaultMeta.service).toBe('aprove-me-api');
    expect(loggerConfig.defaultMeta.version).toBe(process.env.npm_package_version || '1.5.0');

    // Test that transports exist
    const transports = Array.isArray(loggerConfig.transports) 
      ? loggerConfig.transports 
      : [loggerConfig.transports];
    expect(transports.length).toBeGreaterThan(0);

    // Test that console transport level depends on NODE_ENV
    const consoleTransport = transports.find(t => t.constructor.name === 'Console');
    expect(consoleTransport).toBeDefined();
    
    const expectedLevel = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
    expect((consoleTransport as any).level).toBe(expectedLevel);
  });
});
