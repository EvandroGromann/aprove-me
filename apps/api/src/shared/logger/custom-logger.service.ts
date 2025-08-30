import { Injectable, LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Inject } from '@nestjs/common';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class CustomLogger implements LoggerService {
  private context?: string;
  private traceId?: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger
  ) {}

  setContext(context: string) {
    this.context = context;
  }

  setTraceId(traceId: string) {
    this.traceId = traceId;
  }
  // For now we expose only the minimal API used in tests: log (alias), info, warn, error
  log(message: any, contextOrMeta?: any, maybeMeta?: any) {
    this.info(message, contextOrMeta, maybeMeta);
  }

  // Flexible signature: info(message, context?: string, metadata?: any) OR info(message, metadata: any)
  info(message: any, contextOrMeta?: any, maybeMeta?: any) {
    const traceId = this.traceId || RequestContextService.getTraceId();
    let context: string | undefined;
    let metadata: any;

    if (typeof contextOrMeta === 'string' || contextOrMeta === undefined) {
      context = contextOrMeta as string | undefined;
      metadata = maybeMeta;
    } else {
      // second arg is metadata
      metadata = contextOrMeta;
      context = undefined;
    }

    this.logger.info(message, {
      context: context || this.context,
      traceId,
      ...(metadata || {}),
    });
  }

  warn(message: any, contextOrMeta?: any, maybeMeta?: any) {
    const traceId = this.traceId || RequestContextService.getTraceId();
    let context: string | undefined;
    let metadata: any;

    if (typeof contextOrMeta === 'string' || contextOrMeta === undefined) {
      context = contextOrMeta as string | undefined;
      metadata = maybeMeta;
    } else {
      metadata = contextOrMeta;
      context = undefined;
    }

    this.logger.warn(message, {
      context: context || this.context,
      traceId,
      ...(metadata || {}),
    });
  }

  // Backwards-compatible thin wrappers
  debug(message: string, context?: string, metadata?: any) {
    // map to info for now
    this.info(message, context, metadata);
  }

  verbose(message: string, context?: string, metadata?: any) {
    // map to info
    this.info(message, context, metadata);
  }

  flow(step: string, data?: any, context?: string) {
    this.info(step, context, data);
  }

  operation(operationName: string, duration: number, success: boolean = true, data?: any, context?: string) {
    this.info(`${operationName} ${success ? 'completed' : 'failed'} (${duration}ms)`, context, { duration, success, ...data });
  }

  performance(operationName: string, duration: number, details?: any, context?: string) {
    this.info(operationName, context, { duration, ...details });
  }

  audit(action: string, metadata?: any, context?: string) {
    this.info(action, context, { type: 'audit', ...metadata });
  }

  security(event: string, metadata?: any, context?: string) {
    this.warn(event, context, { type: 'security', ...metadata });
  }

  business(event: string, details?: any, context?: string) {
    this.info(event, context, { business: true, ...details });
  }

  error(messageOrError: any | Error, traceOrContext?: string, contextOrMetadata?: string | any, metadata?: any) {
    const traceId = this.traceId || RequestContextService.getTraceId();

    if (messageOrError instanceof Error) {
      const error = messageOrError;
      const context = traceOrContext as string | undefined;
      const meta = contextOrMetadata as any;
      this.logger.error(error.message, {
        context: context || this.context,
        trace: error.stack,
        errorName: error.name,
        traceId,
        ...meta,
      });
    } else {
      // message, optional trace, context, metadata
      const message = messageOrError;
      const trace = traceOrContext as string | undefined;
      const context = contextOrMetadata as string | undefined;
      this.logger.error(message, {
        context: context || this.context,
        trace,
        traceId,
        ...metadata,
      });
    }
  }
}
