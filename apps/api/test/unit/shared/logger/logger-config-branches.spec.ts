import * as winston from 'winston';

describe('Logger Config Environment Branches', () => {
  // Test to force coverage of both NODE_ENV branches in logger.config.ts lines 44-52
  
  beforeEach(() => {
    // Reset all modules before each test
    jest.resetModules();
  });
  
  it('should cover production environment branch', () => {
    // Save original environment
    const originalNodeEnv = process.env.NODE_ENV;
    
    try {
      // Set to production to test the production branch
      process.env.NODE_ENV = 'production';
      
      // Import config with production environment (fresh import due to resetModules)
      const { loggerConfig } = require('../../../../src/shared/logger/logger.config');
      
      // Test that production settings are applied
      const transports = Array.isArray(loggerConfig.transports) 
        ? loggerConfig.transports 
        : [loggerConfig.transports];
      
      const consoleTransport = transports[0] as any;
      
      // In production: level should be 'warn'
      expect(consoleTransport.level).toBe('warn');
      
      // Verify the transport exists and has the expected configuration
      expect(consoleTransport).toBeInstanceOf(winston.transports.Console);
      expect(consoleTransport.format).toBeDefined();
      
    } finally {
      // Restore original environment
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('should cover development environment branch', () => {
    // Save original environment
    const originalNodeEnv = process.env.NODE_ENV;
    
    try {
      // Set to development to test the development branch
      process.env.NODE_ENV = 'development';
      
      // Import config with development environment (fresh import due to resetModules)
      const { loggerConfig } = require('../../../../src/shared/logger/logger.config');
      
      // Test that development settings are applied
      const transports = Array.isArray(loggerConfig.transports) 
        ? loggerConfig.transports 
        : [loggerConfig.transports];
      
      const consoleTransport = transports[0] as any;
      
      // In development: level should be 'debug'
      expect(consoleTransport.level).toBe('debug');
      
      // Verify the transport exists and has the expected configuration
      expect(consoleTransport).toBeInstanceOf(winston.transports.Console);
      expect(consoleTransport.format).toBeDefined();
      
    } finally {
      // Restore original environment
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('should cover test environment branch (neither production nor development)', () => {
    // Save original environment
    const originalNodeEnv = process.env.NODE_ENV;
    
    try {
      // Set to test (which is neither production nor development)
      process.env.NODE_ENV = 'test';
      
      // Import config with test environment
      const { loggerConfig } = require('../../../../src/shared/logger/logger.config');
      
      // Test that non-production settings are applied (should use debug level)
      const transports = Array.isArray(loggerConfig.transports) 
        ? loggerConfig.transports 
        : [loggerConfig.transports];
      
      const consoleTransport = transports[0] as any;
      
      // In test (not production): level should be 'debug'
      expect(consoleTransport.level).toBe('debug');
      
      // Verify the transport exists and has the expected configuration
      expect(consoleTransport).toBeInstanceOf(winston.transports.Console);
      expect(consoleTransport.format).toBeDefined();
      
    } finally {
      // Restore original environment
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('should cover version fallback branch', () => {
    // Save original version
    const originalVersion = process.env.npm_package_version;
    
    try {
      // Test with version set
      process.env.npm_package_version = '2.0.0';
      
      // Import config (fresh import due to resetModules)
      const { loggerConfig } = require('../../../../src/shared/logger/logger.config');
      
      expect(loggerConfig.defaultMeta.version).toBe('2.0.0');
      
    } finally {
      // Restore original version
      if (originalVersion) {
        process.env.npm_package_version = originalVersion;
      } else {
        delete process.env.npm_package_version;
      }
    }
  });

  it('should cover version fallback to default', () => {
    // Save original version
    const originalVersion = process.env.npm_package_version;
    
    try {
      // Test without version (fallback case)
      delete process.env.npm_package_version;
      
      // Import config (fresh import due to resetModules)
      const { loggerConfig } = require('../../../../src/shared/logger/logger.config');
      
      expect(loggerConfig.defaultMeta.version).toBe('1.5.0');
      
    } finally {
      // Restore original version
      if (originalVersion) {
        process.env.npm_package_version = originalVersion;
      }
    }
  });

  it('should cover LOG_LEVEL fallback branch', () => {
    // Save original LOG_LEVEL
    const originalLogLevel = process.env.LOG_LEVEL;
    
    try {
      // Test with LOG_LEVEL set
      process.env.LOG_LEVEL = 'error';
      
      // Import config (fresh import due to resetModules)
      const { loggerConfig } = require('../../../../src/shared/logger/logger.config');
      
      expect(loggerConfig.level).toBe('error');
      
    } finally {
      // Restore original LOG_LEVEL
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      } else {
        delete process.env.LOG_LEVEL;
      }
    }
  });

  it('should cover LOG_LEVEL fallback to default', () => {
    // Save original LOG_LEVEL
    const originalLogLevel = process.env.LOG_LEVEL;
    
    try {
      // Test without LOG_LEVEL (fallback case)
      delete process.env.LOG_LEVEL;
      
      // Import config (fresh import due to resetModules)
      const { loggerConfig } = require('../../../../src/shared/logger/logger.config');
      
      expect(loggerConfig.level).toBe('info');
      
    } finally {
      // Restore original LOG_LEVEL
      if (originalLogLevel) {
        process.env.LOG_LEVEL = originalLogLevel;
      }
    }
  });
});
