import * as winston from 'winston';
import { RequestContextService } from '../context/request-context.service';
import { SENSITIVE_FIELDS } from '../logger/sensitive-fields';

function sanitizeSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeSensitiveData(item));
  }

  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (sanitized.hasOwnProperty(key)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
      
      if (isSensitive) {
        sanitized[key] = '***';
      } else if (typeof sanitized[key] === 'object') {
        sanitized[key] = sanitizeSensitiveData(sanitized[key]);
      }
    }
  }
  
  return sanitized;
}

const fallbackLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message, context, traceId, ...meta }) => {
      const formattedMeta = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} [${traceId}] [${context}] ${level}: ${message}${formattedMeta}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

interface LogOptions {
  message?: string;
  input?: boolean;
  output?: boolean;
  duration?: boolean;
}

export function Log(options?: string | LogOptions) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    let config: LogOptions;
    if (typeof options === 'string') {
      config = { message: options, input: true, output: false, duration: false };
    } else if (options && typeof options === 'object') {
      config = { 
        message: options.message,
        input: options.input !== false, // default true
        output: options.output === true, // default false
        duration: options.duration === true // default false
      };
    } else {
      config = { input: true, output: false, duration: false };
    }

    descriptor.value = async function (...args: any[]) {
      const className = this.constructor.name;
      const startTime = Date.now();
      const traceId = RequestContextService.getTraceId();
      const message = config.message || propertyName;
      let duration = 0;

      // Log de entrada (input)
      if (config.input) {
        let params: Record<string, any> = {};
        if (args.length > 0) {
          const firstArg = args[0];
          if (typeof firstArg === 'object' && firstArg !== null) {
            const dtoName = firstArg.constructor?.name || 'params';
            if (dtoName.toLowerCase().includes('dto')) {
              const key = dtoName.charAt(0).toLowerCase() + dtoName.slice(1);
              const sanitizedArg = sanitizeSensitiveData(firstArg);
              params[key] = sanitizedArg;
            } else {
              params.data = sanitizeSensitiveData(firstArg);
            }
          } else {
            params.value = firstArg;
          }
        }
        const instanceLogger = (this && this.logger) ? this.logger : fallbackLogger;
        if (config.duration) {
          duration = Date.now() - startTime;
          instanceLogger.info(`${message} (${duration}ms) input:`, {
            context: className,
            traceId,
            ...params
          } as any);
        } else {
          instanceLogger.info(`${message} input:`, {
            context: className,
            traceId,
            ...params
          } as any);
        }
      }

      try {
        const result = await method.apply(this, args);

        // Log de saída (output)
        if (config.output) {
          const sanitizedResult = sanitizeSensitiveData(result);
          const instanceLogger = (this && this.logger) ? this.logger : fallbackLogger;
          if (config.duration) {
            duration = Date.now() - startTime;
            instanceLogger.info(`${message} (${duration}ms) output:`, {
              context: className,
              traceId,
              ...(
                typeof sanitizedResult === 'object' && sanitizedResult !== null
                  ? sanitizedResult
                  : { value: sanitizedResult }
              )
            } as any);
          } else {
            instanceLogger.info(`${message} output:`, {
              context: className,
              traceId,
              ...(
                typeof sanitizedResult === 'object' && sanitizedResult !== null
                  ? sanitizedResult
                  : { value: sanitizedResult }
              )
            } as any);
          }
        }

        return result;
      } catch (error) {
        duration = Date.now() - startTime;
        const instanceLogger = (this && this.logger) ? this.logger : fallbackLogger;
        instanceLogger.error(`${message} failed (${duration}ms)`, {
          context: className,
          traceId,
          error: error.message
        } as any);
        throw error;
      }
    };
  };
}
