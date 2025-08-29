import { Test, TestingModule } from '@nestjs/testing';
import { AssignorsModule } from '../../../../src/modules/assignors/assignors.module';
import { AssignorsController } from '../../../../src/modules/assignors/assignors.controller';
import { AssignorsService } from '../../../../src/modules/assignors/assignors.service';
import { AssignorRepository } from '../../../../src/modules/assignors/repositories/assignor.repository';
import { PrismaAssignorRepository } from '../../../../src/modules/assignors/repositories/prisma-assignor.repository';
import { PrismaModule } from '../../../../src/shared/database/prisma.module';

describe('AssignorsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AssignorsModule, PrismaModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AssignorsController', () => {
    const controller = module.get<AssignorsController>(AssignorsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(AssignorsController);
  });

  it('should provide AssignorsService', () => {
    const service = module.get<AssignorsService>(AssignorsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(AssignorsService);
  });

  it('should provide AssignorRepository with PrismaAssignorRepository implementation', () => {
    const repository = module.get<AssignorRepository>(AssignorRepository);
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(PrismaAssignorRepository);
  });

  it('should export AssignorRepository', async () => {
    const exportedModule = await Test.createTestingModule({
      imports: [AssignorsModule, PrismaModule],
      providers: [
        {
          provide: 'TEST_SERVICE',
          useFactory: (assignorRepository: AssignorRepository) => {
            return { assignorRepository };
          },
          inject: [AssignorRepository],
        },
      ],
    }).compile();

    const testService = exportedModule.get('TEST_SERVICE');
    expect(testService.assignorRepository).toBeInstanceOf(PrismaAssignorRepository);
  });
});
