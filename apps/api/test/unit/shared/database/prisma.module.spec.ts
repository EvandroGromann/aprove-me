import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../../../../src/shared/database/prisma.module';
import { PrismaService } from '../../../../src/shared/database/prisma.service';

jest.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    assignor = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };
    payable = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };
  },
}));

describe('PrismaModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
    expect(typeof prismaService.onModuleInit).toBe('function');
  });

  it('should export PrismaService', async () => {
    const exportedModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [
        {
          provide: 'TEST_SERVICE',
          useFactory: (prismaService: PrismaService) => {
            return { prismaService };
          },
          inject: [PrismaService],
        },
      ],
    }).compile();

    const testService = exportedModule.get('TEST_SERVICE');
    expect(testService.prismaService).toBeDefined();
    expect(typeof testService.prismaService.onModuleInit).toBe('function');
  });
});
