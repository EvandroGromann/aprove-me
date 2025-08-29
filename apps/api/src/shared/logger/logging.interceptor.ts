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
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('HTTP');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];
    
    // Extract user info if available
    const user = (request as any).user;
    const userId = user?.id || user?.sub;
    
    // Log incoming request
    this.logger.log(`Incoming ${method} ${url}`, 'HTTP', {
      method,
      url,
      ip,
      userAgent,
      userId,
      requestId: this.generateRequestId()
    });

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const { statusCode } = response;
        
        // Log successful response
        this.logger.performance(`${method} ${url}`, duration, {
          statusCode,
          responseSize: JSON.stringify(data).length,
          userId
        });

        // Log business events for important operations
        if (this.isBusinessOperation(method, url)) {
          this.logger.business(`${method} ${url} completed`, {
            statusCode,
            duration,
            userId,
            endpoint: url
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        // Log error response
        this.logger.error(`${method} ${url} failed`, error.stack, 'HTTP', {
          method,
          url,
          statusCode: error.status || 500,
          duration,
          userId,
          errorMessage: error.message,
          errorName: error.name
        });

        // Log security events for authentication/authorization failures
        if (this.isSecurityError(error)) {
          this.logger.security('Authentication/Authorization failure', {
            method,
            url,
            ip,
            userAgent,
            userId,
            errorStatus: error.status,
            errorMessage: error.message
          });
        }

        return throwError(() => error);
      })
    );
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private isBusinessOperation(method: string, url: string): boolean {
    const businessEndpoints = [
      '/payables',
      '/assignors', 
      '/users',
      '/auth/login',
      '/auth/register'
    ];
    
    return businessEndpoints.some(endpoint => url.includes(endpoint)) && 
           ['POST', 'PUT', 'DELETE'].includes(method);
  }

  private isSecurityError(error: any): boolean {
    return error.status === 401 || error.status === 403;
  }
}
