import { Module } from '@nestjs/common';
import { PayablesModule } from './modules/payables/payables.module';
import { AssignorsModule } from './modules/assignors/assignors.module';

@Module({
  imports: [PayablesModule, AssignorsModule],
  controllers: [],
  providers: [],
})

export class AppModule {}
