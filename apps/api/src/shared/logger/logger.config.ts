import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Função exportada para permitir teste do formatter sem acoplar ao colorize
export const buildConsoleFormat = () => printf(({ level, message, timestamp, context, trace, traceId, ...meta }) => {
  let log = `${timestamp}`;

  if (traceId) {
    log += ` [${traceId}]`;
  }

  log += ` [${context || 'App'}]`;

  // Voltar a mostrar o texto do level para todos os logs
  const formattedLevel = level === 'warn' ? 'warning:' : `${String(level).toLowerCase()}:`;
  log += ` ${formattedLevel}`;

  log += ` ${message}`;

  // Only show relevant metadata in console (not service/version)
  const relevantMeta = Object.keys(meta).reduce((acc: Record<string, unknown>, key) => {
    if (!['service', 'version'].includes(key)) {
      acc[key] = (meta as any)[key];
    }
    return acc;
  }, {} as Record<string, unknown>);

  if (Object.keys(relevantMeta).length > 0) {
    log += ` ${JSON.stringify(relevantMeta)}`;
  }

  if (trace) {
    log += `\n${trace}`;
  }

  return log;
});

// Custom format para console usa o builder acima
const consoleFormat = buildConsoleFormat();

// Custom format for file logging
const fileFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  json()
);

// Custom format for console logging with colors
const consoleColorFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  consoleFormat
);

export const loggerConfig: WinstonModuleOptions = {
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    errors({ stack: true })
  ),
  defaultMeta: {
    service: 'aprove-me-api',
    version: process.env.npm_package_version || '1.5.0'
  },
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' 
        ? combine(timestamp(), json())
        : consoleColorFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for error logs only
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for audit logs (info and above)
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ],
  
  // Exception handling
  exceptionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/exceptions.log',
      format: fileFormat
    })
  ],
  
  // Rejection handling
  rejectionHandlers: [
    new winston.transports.File({ 
      filename: 'logs/rejections.log',
      format: fileFormat
    })
  ]
};
