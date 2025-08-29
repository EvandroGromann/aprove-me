import { Module } from '@nestjs/common';
import { PayablesModule } from './modules/payables/payables.module';

@Module({
  imports: [PayablesModule],
  controllers: [],
  providers: [],
})

export class AppModule {}
