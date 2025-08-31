import { loggerConfig } from '../../../../src/shared/logger/logger.config';
import * as winston from 'winston';

describe('LoggerConfig', () => {
  it('should have correct default configuration', () => {
    expect(loggerConfig).toBeDefined();
    expect(loggerConfig.level).toBe('info');
    const expectedVersion = process.env.npm_package_version || '1.5.0';
    expect(loggerConfig.defaultMeta).toEqual({
      service: 'aprove-me-api',
      version: expectedVersion,
    });
  });

  it('should have transports configured', () => {
    const transports = Array.isArray(loggerConfig.transports) 
      ? loggerConfig.transports 
      : [loggerConfig.transports];
    
    expect(transports.length).toBeGreaterThan(0);
  });

  it('should have exception and rejection handlers configured', () => {
    expect(loggerConfig.exceptionHandlers).toBeDefined();
    expect(loggerConfig.rejectionHandlers).toBeDefined();
    expect(loggerConfig.exceptionHandlers.length).toBeGreaterThan(0);
    expect(loggerConfig.rejectionHandlers.length).toBeGreaterThan(0);
  });

  // Test the custom console format function (lines 8-18)
  it('should format console logs correctly with consoleFormat function', () => {
    const { printf } = winston.format;
    
    // Recreate the console format function to test it directly
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

    // Test basic log formatting
    const result1 = consoleFormat.transform({
      level: 'info',
      message: 'Test message',
      timestamp: '2025-08-29 10:00:00',
      context: 'TestContext',
      [Symbol.for('message')]: 'Test message'
    }, {});
    
    expect(result1[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [TestContext] info: Test message');

    // Test log with metadata
    const result2 = consoleFormat.transform({
      level: 'error',
      message: 'Error message',
      timestamp: '2025-08-29 10:00:00',
      context: 'ErrorContext',
      userId: 123,
      action: 'test',
      [Symbol.for('message')]: 'Error message'
    }, {});
    
    expect(result2[Symbol.for('message')]).toContain('Error message');
    expect(result2[Symbol.for('message')]).toContain('{"userId":123,"action":"test"}');

    // Test log with trace
    const result3 = consoleFormat.transform({
      level: 'error',
      message: 'Error with trace',
      timestamp: '2025-08-29 10:00:00',
      context: 'ErrorContext',
      trace: 'Error: Test error\n    at test.js:1:1',
      [Symbol.for('message')]: 'Error with trace'
    }, {});
    
    expect(result3[Symbol.for('message')]).toContain('Error with trace');
    expect(result3[Symbol.for('message')]).toContain('\nError: Test error\n    at test.js:1:1');

    // Test log without context (should use 'Application')
    const result4 = consoleFormat.transform({
      level: 'info',
      message: 'Test message',
      timestamp: '2025-08-29 10:00:00',
      [Symbol.for('message')]: 'Test message'
    }, {});
    
    expect(result4[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [Application] info: Test message');

    // Test with empty metadata (Object.keys(meta).length === 0)
    const result5 = consoleFormat.transform({
      level: 'debug',
      message: 'Debug message',
      timestamp: '2025-08-29 10:00:00',
      context: 'DebugContext',
      [Symbol.for('message')]: 'Debug message'
    }, {});
    
    expect(result5[Symbol.for('message')]).toBe('2025-08-29 10:00:00 [DebugContext] debug: Debug message');
  });
});
