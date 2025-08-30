import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CustomLogger } from './custom-logger.service';
import { Request, Response } from 'express';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private sensitiveFields = ['password', 'access_token', 'authorization', 'secret', 'key'];

  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const handler = context.getHandler();
    const controller = context.getClass();
    
    const { method, url, body, query, params } = request;
    const user = (request as any).user;
    
    // Auto-extract controller context
    const contextName = controller.name; // Usar nome completo da classe
    this.logger.setContext(contextName);
    
    // Auto-log incoming request - mais simples, sem dados duplicados do HTTP
    this.logger.info(`${handler.name}`, contextName);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        
        // Auto-log successful operation - mais simples
        this.logger.info(`${handler.name} completed (${duration}ms)`, contextName, {
          duration,
          statusCode: response.statusCode,
          responseType: Array.isArray(data) ? 'array' : typeof data
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        // Auto-log error
        this.logger.error(`${handler.name} failed (${duration}ms): ${error.message}`, error.stack, contextName, {
          duration,
          statusCode: error.status || 500,
          errorType: error.constructor.name
        });

        return throwError(() => error);
      })
    );
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    
    for (const field of this.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '***';
      }
    }
    
    return sanitized;
  }
}
