import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { CustomLogger } from './custom-logger.service';
import { sanitizeSensitiveData } from './sanitize-sensitive-data';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('RequestMiddleware');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const traceId = this.generateRequestId();
    const { method, headers } = req;
    const logger = this.logger;
    
    // Set trace context for the entire request
    RequestContextService.setTraceId(traceId);
    
    // Normalizar IP: ::1 (IPv6 localhost) -> 127.0.0.1
    const normalizedIp = req.ip === '::1' ? '127.0.0.1' : req.ip;
    
    // Filtrar User Agent - apenas navegadores reais
    const userAgent = headers['user-agent'] || '';
    const isRealBrowser = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari') || userAgent.includes('Firefox');
    
    // Set traceId for this request context
    logger.setTraceId(traceId);
    
    // Store traceId in request for other components to use
    (req as any).traceId = traceId;
    
    // Log de entrada como objeto
    const logData: any = {
      ip: normalizedIp,
      method,
      url: req.originalUrl,
      traceId,
      userAgent,
    };
    if (isRealBrowser) {
      const browserMatch = userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/);
      if (browserMatch) {
        logData.browser = browserMatch[0];
      }
    }
    logger.info(`${method} ${req.originalUrl}`, 'HttpRequest', logData);
    
    const originalSend = res.send;
    const originalJson = res.json;
    let hasLogged = false; // Flag para evitar duplicação
    
    // Interceptar tanto send quanto json
    const logResponse = (body: any) => {
      if (hasLogged) return; // Evitar log duplicado
      hasLogged = true;
      
      const duration = Date.now() - startTime;
      const { statusCode } = res;
      
      const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
      let message = `${method} ${req.originalUrl} {${statusCode}} (${duration}ms)`;
      let metadata: any = undefined;
      
      // Incluir a resposta para todos os casos, sanitizando dados sensíveis
      if (body !== undefined) {
        try {
          if (typeof body === 'string') {
            try {
              metadata = sanitizeSensitiveData(JSON.parse(body));
            } catch {
              metadata = { msg: body };
            }
          } else if (typeof body === 'object' && body !== null) {
            metadata = sanitizeSensitiveData(body);
          } else {
            metadata = { msg: body.toString() };
          }
        } catch (e) {
          let msg: string | undefined;
          try {
            const maybeToString = (body as any)?.toString;
            msg = typeof maybeToString === 'function' ? maybeToString.call(body) : undefined;
          } catch {
            msg = undefined;
          }
          metadata = { msg: msg || 'Unknown response' };
        }
      }
      
      logger[logLevel](message, 'HttpResponse', metadata);
    };
    
    res.send = function(body) {
      logResponse(body);
      return originalSend.call(this, body);
    };
    
    res.json = function(body) {
      logResponse(body);
      return originalJson.call(this, body);
    };

    next();
  }

  private generateRequestId(): string {
    return randomUUID();
  }
}
