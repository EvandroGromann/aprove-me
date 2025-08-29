import { Module } from '@nestjs/common';
import { AssignorsService } from './assignors.service';
import { AssignorsController } from './assignors.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AssignorRepository } from './repositories/assignor.repository';
import { PrismaAssignorRepository } from './repositories/prisma-assignor.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AssignorsController],
  providers: [
    AssignorsService,
    {
      provide: AssignorRepository,
      useClass: PrismaAssignorRepository,
    },
  ],
  exports: [AssignorRepository],
})

export class AssignorsModule {}
