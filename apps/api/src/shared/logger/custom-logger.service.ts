import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {
  private context?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string, metadata?: any) {
    this.logger.info(message, { 
      context: context || this.context,
      ...metadata 
    });
  }

  error(message: any, trace?: string, context?: string, metadata?: any) {
    this.logger.error(message, { 
      context: context || this.context,
      trace,
      ...metadata
    });
  }

  warn(message: any, context?: string, metadata?: any) {
    this.logger.warn(message, { 
      context: context || this.context,
      ...metadata 
    });
  }

  debug(message: any, context?: string, metadata?: any) {
    this.logger.debug(message, { 
      context: context || this.context,
      ...metadata 
    });
  }

  verbose(message: any, context?: string, metadata?: any) {
    this.logger.verbose(message, { 
      context: context || this.context,
      ...metadata 
    });
  }

  // Additional logging methods for audit and business logic
  audit(action: string, details: any, userId?: string, context?: string) {
    this.logger.info(`AUDIT: ${action}`, {
      context: context || this.context,
      action,
      userId,
      details,
      audit: true
    });
  }

  security(event: string, details: any, context?: string) {
    this.logger.warn(`SECURITY: ${event}`, {
      context: context || this.context,
      event,
      details,
      security: true
    });
  }

  performance(operation: string, duration: number, details?: any, context?: string) {
    this.logger.info(`PERFORMANCE: ${operation} took ${duration}ms`, {
      context: context || this.context,
      operation,
      duration,
      details,
      performance: true
    });
  }

  business(event: string, details: any, context?: string) {
    this.logger.info(`BUSINESS: ${event}`, {
      context: context || this.context,
      event,
      details,
      business: true
    });
  }
}
