import { Module } from '@nestjs/common';
import { PayablesController } from './payables.controller';
import { PayablesService } from './payables.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AssignorsModule } from '../assignors/assignors.module';
import { PayableRepository } from './repositories/payable.repository';
import { PrismaPayableRepository } from './repositories/prisma-payable.repository';

@Module({
  imports: [PrismaModule, AssignorsModule],
  controllers: [PayablesController],
  providers: [
    PayablesService,
    {
      provide: PayableRepository,
      useClass: PrismaPayableRepository,
    },
  ],
})
export class PayablesModule {}
