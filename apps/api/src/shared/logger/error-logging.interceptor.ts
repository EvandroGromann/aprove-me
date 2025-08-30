import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CustomLogger } from './custom-logger.service';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const handler = context.getHandler();
    const controller = context.getClass();
    
    return next.handle().pipe(
      catchError((error) => {
        const contextName = `${controller.name}`;
        
        this.logger.error(
          `${method} ${url} failed in ${handler.name}()`,
          undefined,
          contextName,
          {
            method,
            url,
            handler: handler.name,
            errorType: error.constructor.name,
            statusCode: error.status || 500
          }
        );
        
        return throwError(() => error);
      })
    );
  }
}
