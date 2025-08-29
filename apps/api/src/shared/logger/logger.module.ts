import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { loggerConfig } from './logger.config';
import { CustomLogger } from './custom-logger.service';
import { LoggingInterceptor } from './logging.interceptor';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot(loggerConfig)
  ],
  providers: [
    CustomLogger,
    LoggingInterceptor
  ],
  exports: [
    CustomLogger,
    LoggingInterceptor,
    WinstonModule
  ]
})
export class LoggerModule {}
