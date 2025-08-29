import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { Logger } from 'winston';

describe('CustomLogger', () => {
  let logger: CustomLogger;
  let winstonLogger: jest.Mocked<Logger>;

  const mockWinstonLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomLogger,
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockWinstonLogger,
        },
      ],
    }).compile();

    logger = module.get<CustomLogger>(CustomLogger);
    winstonLogger = module.get(WINSTON_MODULE_PROVIDER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setContext', () => {
    it('should set the context', () => {
      const context = 'TestContext';
      logger.setContext(context);
      
      // Context is private, so we test it indirectly through other methods
      logger.log('test message');
      
      expect(winstonLogger.info).toHaveBeenCalledWith('test message', {
        context: 'TestContext'
      });
    });
  });

  describe('log', () => {
    it('should call winston info with message and context', () => {
      logger.log('Test message', 'TestContext');
      
      expect(winstonLogger.info).toHaveBeenCalledWith('Test message', {
        context: 'TestContext'
      });
    });

    it('should call winston info with message, context and metadata', () => {
      const metadata = { userId: 123, action: 'test' };
      logger.log('Test message', 'TestContext', metadata);
      
      expect(winstonLogger.info).toHaveBeenCalledWith('Test message', {
        context: 'TestContext',
        userId: 123,
        action: 'test'
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultContext');
      logger.log('Test message');
      
      expect(winstonLogger.info).toHaveBeenCalledWith('Test message', {
        context: 'DefaultContext'
      });
    });

    it('should use provided context over default context', () => {
      logger.setContext('DefaultContext');
      logger.log('Test message', 'OverrideContext');
      
      expect(winstonLogger.info).toHaveBeenCalledWith('Test message', {
        context: 'OverrideContext'
      });
    });
  });

  describe('error', () => {
    it('should call winston error with message, trace and context', () => {
      const trace = 'Error trace';
      logger.error('Error message', trace, 'ErrorContext');
      
      expect(winstonLogger.error).toHaveBeenCalledWith('Error message', {
        context: 'ErrorContext',
        trace: 'Error trace'
      });
    });

    it('should call winston error with metadata', () => {
      const metadata = { errorCode: 500 };
      logger.error('Error message', 'trace', 'ErrorContext', metadata);
      
      expect(winstonLogger.error).toHaveBeenCalledWith('Error message', {
        context: 'ErrorContext',
        trace: 'trace',
        errorCode: 500
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultErrorContext');
      logger.error('Error message', 'trace');
      
      expect(winstonLogger.error).toHaveBeenCalledWith('Error message', {
        context: 'DefaultErrorContext',
        trace: 'trace'
      });
    });

    it('should use provided context over default context', () => {
      logger.setContext('DefaultContext');
      logger.error('Error message', 'trace', 'OverrideContext');
      
      expect(winstonLogger.error).toHaveBeenCalledWith('Error message', {
        context: 'OverrideContext',
        trace: 'trace'
      });
    });
  });

  describe('warn', () => {
    it('should call winston warn with message and context', () => {
      logger.warn('Warning message', 'WarnContext');
      
      expect(winstonLogger.warn).toHaveBeenCalledWith('Warning message', {
        context: 'WarnContext'
      });
    });

    it('should call winston warn with metadata', () => {
      const metadata = { level: 'high' };
      logger.warn('Warning message', 'WarnContext', metadata);
      
      expect(winstonLogger.warn).toHaveBeenCalledWith('Warning message', {
        context: 'WarnContext',
        level: 'high'
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultWarnContext');
      logger.warn('Warning message');
      
      expect(winstonLogger.warn).toHaveBeenCalledWith('Warning message', {
        context: 'DefaultWarnContext'
      });
    });

    it('should use provided context over default context', () => {
      logger.setContext('DefaultContext');
      logger.warn('Warning message', 'OverrideContext');
      
      expect(winstonLogger.warn).toHaveBeenCalledWith('Warning message', {
        context: 'OverrideContext'
      });
    });
  });

  describe('debug', () => {
    it('should call winston debug with message and context', () => {
      logger.debug('Debug message', 'DebugContext');
      
      expect(winstonLogger.debug).toHaveBeenCalledWith('Debug message', {
        context: 'DebugContext'
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultDebugContext');
      logger.debug('Debug message');
      
      expect(winstonLogger.debug).toHaveBeenCalledWith('Debug message', {
        context: 'DefaultDebugContext'
      });
    });

    it('should use provided context over default context', () => {
      logger.setContext('DefaultContext');
      logger.debug('Debug message', 'OverrideContext');
      
      expect(winstonLogger.debug).toHaveBeenCalledWith('Debug message', {
        context: 'OverrideContext'
      });
    });
  });

  describe('verbose', () => {
    it('should call winston verbose with message and context', () => {
      logger.verbose('Verbose message', 'VerboseContext');
      
      expect(winstonLogger.verbose).toHaveBeenCalledWith('Verbose message', {
        context: 'VerboseContext'
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultVerboseContext');
      logger.verbose('Verbose message');
      
      expect(winstonLogger.verbose).toHaveBeenCalledWith('Verbose message', {
        context: 'DefaultVerboseContext'
      });
    });

    it('should use provided context over default context', () => {
      logger.setContext('DefaultContext');
      logger.verbose('Verbose message', 'OverrideContext');
      
      expect(winstonLogger.verbose).toHaveBeenCalledWith('Verbose message', {
        context: 'OverrideContext'
      });
    });
  });

  describe('audit', () => {
    it('should log audit information with provided context', () => {
      const action = 'USER_LOGIN';
      const details = { ip: '127.0.0.1' };
      const userId = 'user123';
      
      logger.audit(action, details, userId, 'AuditContext');
      
      expect(winstonLogger.info).toHaveBeenCalledWith('AUDIT: USER_LOGIN', {
        context: 'AuditContext',
        action: 'USER_LOGIN',
        userId: 'user123',
        details: { ip: '127.0.0.1' },
        audit: true
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultAuditContext');
      const action = 'USER_LOGOUT';
      const details = { sessionId: 'session123' };
      const userId = 'user456';
      
      logger.audit(action, details, userId);
      
      expect(winstonLogger.info).toHaveBeenCalledWith('AUDIT: USER_LOGOUT', {
        context: 'DefaultAuditContext',
        action: 'USER_LOGOUT',
        userId: 'user456',
        details: { sessionId: 'session123' },
        audit: true
      });
    });
  });

  describe('security', () => {
    it('should log security events with provided context', () => {
      const event = 'FAILED_LOGIN';
      const details = { attempts: 3 };
      
      logger.security(event, details, 'SecurityContext');
      
      expect(winstonLogger.warn).toHaveBeenCalledWith('SECURITY: FAILED_LOGIN', {
        context: 'SecurityContext',
        event: 'FAILED_LOGIN',
        details: { attempts: 3 },
        security: true
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultSecurityContext');
      const event = 'SUSPICIOUS_ACTIVITY';
      const details = { userId: 'user789', activity: 'multiple_failed_attempts' };
      
      logger.security(event, details);
      
      expect(winstonLogger.warn).toHaveBeenCalledWith('SECURITY: SUSPICIOUS_ACTIVITY', {
        context: 'DefaultSecurityContext',
        event: 'SUSPICIOUS_ACTIVITY',
        details: { userId: 'user789', activity: 'multiple_failed_attempts' },
        security: true
      });
    });
  });

  describe('performance', () => {
    it('should log performance metrics with provided context', () => {
      const operation = 'DATABASE_QUERY';
      const duration = 150;
      const details = { query: 'SELECT * FROM users' };
      
      logger.performance(operation, duration, details, 'PerformanceContext');
      
      expect(winstonLogger.info).toHaveBeenCalledWith('PERFORMANCE: DATABASE_QUERY took 150ms', {
        context: 'PerformanceContext',
        operation: 'DATABASE_QUERY',
        duration: 150,
        details: { query: 'SELECT * FROM users' },
        performance: true
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultPerformanceContext');
      const operation = 'API_CALL';
      const duration = 75;
      const details = { endpoint: '/api/users', method: 'GET' };
      
      logger.performance(operation, duration, details);
      
      expect(winstonLogger.info).toHaveBeenCalledWith('PERFORMANCE: API_CALL took 75ms', {
        context: 'DefaultPerformanceContext',
        operation: 'API_CALL',
        duration: 75,
        details: { endpoint: '/api/users', method: 'GET' },
        performance: true
      });
    });

    it('should log performance metrics without details', () => {
      logger.setContext('PerformanceContext');
      const operation = 'CACHE_LOOKUP';
      const duration = 5;
      
      logger.performance(operation, duration);
      
      expect(winstonLogger.info).toHaveBeenCalledWith('PERFORMANCE: CACHE_LOOKUP took 5ms', {
        context: 'PerformanceContext',
        operation: 'CACHE_LOOKUP',
        duration: 5,
        details: undefined,
        performance: true
      });
    });
  });

  describe('business', () => {
    it('should log business events with provided context', () => {
      const event = 'PAYMENT_PROCESSED';
      const details = { amount: 1000, currency: 'BRL' };
      
      logger.business(event, details, 'BusinessContext');
      
      expect(winstonLogger.info).toHaveBeenCalledWith('BUSINESS: PAYMENT_PROCESSED', {
        context: 'BusinessContext',
        event: 'PAYMENT_PROCESSED',
        details: { amount: 1000, currency: 'BRL' },
        business: true
      });
    });

    it('should use default context when none provided', () => {
      logger.setContext('DefaultBusinessContext');
      const event = 'ORDER_CREATED';
      const details = { orderId: 'ORD-123', customerId: 'CUST-456' };
      
      logger.business(event, details);
      
      expect(winstonLogger.info).toHaveBeenCalledWith('BUSINESS: ORDER_CREATED', {
        context: 'DefaultBusinessContext',
        event: 'ORDER_CREATED',
        details: { orderId: 'ORD-123', customerId: 'CUST-456' },
        business: true
      });
    });
  });
});
