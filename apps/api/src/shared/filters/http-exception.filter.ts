import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomLogger } from '../logger/custom-logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {
    this.logger.setContext('HttpExceptionFilter');
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extrair traceId da request se existir
    const traceId = (request as any).traceId;
    if (traceId) {
      this.logger.setTraceId(traceId);
    }

    // Não logar aqui - será capturado pelo middleware de response
    // que terá informações mais completas incluindo duração

    // Responder com o erro original
    response.status(status).json(exceptionResponse);
  }
}
