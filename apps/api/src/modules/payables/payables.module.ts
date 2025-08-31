import { Module } from '@nestjs/common';
import { PayablesController } from './payables.controller';
import { PayablesService } from './payables.service';
import { PrismaModule } from '../../shared/database/prisma.module';
import { SharedAuthModule } from '../../shared/auth/shared-auth.module';
import { AssignorsModule } from '../assignors/assignors.module';
import { PayableRepository } from './repositories/payable.repository';
import { PrismaPayableRepository } from './repositories/prisma-payable.repository';
import { EmailService } from '../../shared/notifications/email.service';
import { BullModule } from '@nestjs/bull';
import { PayablesConsumer, PAYABLE_QUEUE } from './payables.consumer';

@Module({
  imports: [
    PrismaModule,
    SharedAuthModule,
    AssignorsModule,
    BullModule.forRoot({
      redis: process.env.REDIS_URL || 'redis://localhost:6379',
    }),
    BullModule.registerQueue({ name: PAYABLE_QUEUE as string }),
  ],
  controllers: [PayablesController],
  providers: [
    PayablesService,
    PayablesConsumer,
    EmailService,
    {
      provide: PayableRepository,
      useClass: PrismaPayableRepository,
    },
  ],
})
export class PayablesModule {}
