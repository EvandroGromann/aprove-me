import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CustomLogger } from './custom-logger.service';

@Injectable()
export class SimpleLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: CustomLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const controller = context.getClass();
    const handler = context.getHandler();
    
    // Auto-extract controller context
    const contextName = controller.name;
    this.logger.setContext(contextName);
    
    // Log apenas entrada do controller - sem duplicar o service
    this.logger.info(`${handler.name}`, contextName);

    return next.handle().pipe(
      tap(() => {
        // Não loga saída para evitar duplicação com decorators
      })
    );
  }
}
