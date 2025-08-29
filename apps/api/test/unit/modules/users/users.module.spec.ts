import { Test, TestingModule } from '@nestjs/testing';
import { UsersModule } from '../../../../src/modules/users/users.module';
import { UsersService } from '../../../../src/modules/users/users.service';
import { UsersController } from '../../../../src/modules/users/users.controller';
import { UsersRepository } from '../../../../src/modules/users/repositories/users.repository';
import { PrismaModule } from '../../../../src/shared/database/prisma.module';
import { LoggerModule } from '../../../../src/shared/logger/logger.module';

describe('UsersModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UsersModule, PrismaModule, LoggerModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have UsersController', () => {
    const controller = module.get<UsersController>(UsersController);
    expect(controller).toBeDefined();
  });

  it('should have UsersService', () => {
    const service = module.get<UsersService>(UsersService);
    expect(service).toBeDefined();
  });

  it('should have UsersRepository', () => {
    const repository = module.get<UsersRepository>(UsersRepository);
    expect(repository).toBeDefined();
  });

  it('should export UsersService', () => {
    const service = module.get<UsersService>(UsersService);
    expect(service).toBeInstanceOf(UsersService);
  });
});
