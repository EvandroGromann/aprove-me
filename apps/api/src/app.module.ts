import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PayablesModule } from './modules/payables/payables.module';
import { AssignorsModule } from './modules/assignors/assignors.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SharedAuthModule } from './shared/auth/shared-auth.module';
import { LoggerModule } from './shared/logger/logger.module';
import { RequestLoggingMiddleware } from './shared/logger/request-logging.middleware';

@Module({
  imports: [LoggerModule, SharedAuthModule, PayablesModule, AssignorsModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes('*'); // Aplica para todas as rotas
  }
}
