import { Module } from '@nestjs/common';
import { PayablesModule } from './modules/payables/payables.module';
import { AssignorsModule } from './modules/assignors/assignors.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SharedAuthModule } from './shared/auth/shared-auth.module';
import { LoggerModule } from './shared/logger/logger.module';

@Module({
  imports: [LoggerModule, SharedAuthModule, PayablesModule, AssignorsModule, AuthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
