import { Module } from '@nestjs/common';
import { PayablesModule } from './modules/payables/payables.module';
import { AssignorsModule } from './modules/assignors/assignors.module';
import { AuthModule } from './modules/auth/auth.module';
import { SharedAuthModule } from './shared/auth/shared-auth.module';

@Module({
  imports: [SharedAuthModule, PayablesModule, AssignorsModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
