import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './logger.config';
import { CustomLogger } from './custom-logger.service';
import { RequestLoggingMiddleware } from './request-logging.middleware';
import { RequestContextService } from '../context/request-context.service';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig)
  ],
  providers: [
    CustomLogger,
    RequestLoggingMiddleware,
    RequestContextService
  ],
  exports: [
    CustomLogger,
    RequestLoggingMiddleware,
    RequestContextService,
    WinstonModule
  ]
})
export class LoggerModule {}
