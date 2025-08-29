import { Test, TestingModule } from '@nestjs/testing';
import { PayablesModule } from '../../../../src/modules/payables/payables.module';
import { PayablesController } from '../../../../src/modules/payables/payables.controller';
import { PayablesService } from '../../../../src/modules/payables/payables.service';
import { PayableRepository } from '../../../../src/modules/payables/repositories/payable.repository';
import { PrismaPayableRepository } from '../../../../src/modules/payables/repositories/prisma-payable.repository';
import { AssignorsModule } from '../../../../src/modules/assignors/assignors.module';
import { PrismaModule } from '../../../../src/shared/database/prisma.module';

describe('PayablesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PayablesModule, PrismaModule, AssignorsModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PayablesController', () => {
    const controller = module.get<PayablesController>(PayablesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(PayablesController);
  });

  it('should provide PayablesService', () => {
    const service = module.get<PayablesService>(PayablesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(PayablesService);
  });

  it('should provide PayableRepository with PrismaPayableRepository implementation', () => {
    const repository = module.get<PayableRepository>(PayableRepository);
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(PrismaPayableRepository);
  });
});
