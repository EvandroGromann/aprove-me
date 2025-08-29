import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../../../src/shared/database/prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should extend PrismaClient', () => {
    expect(service).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
    expect(typeof service.$connect).toBe('function');
  });

  describe('onModuleInit', () => {
    it('should call $connect', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
      
      connectSpy.mockRestore();
    });
  });
});
