import { Test, TestingModule } from '@nestjs/testing';
import { PrismaPayableRepository } from '../../../../src/modules/payables/repositories/prisma-payable.repository';
import { PrismaService } from '../../../../src/shared/database/prisma.service';
import { PayableEntity } from '../../../../src/modules/payables/entities/payable.entity';
import { AssignorEntity } from '../../../../src/modules/assignors/entities/assignor.entity';

describe('PrismaPayableRepository', () => {
  let repository: PrismaPayableRepository;
  let prismaService: jest.Mocked<PrismaService>;

  const mockAssignor: AssignorEntity = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    document: '12345678900',
    email: 'test@example.com',
    phone: '11999888777',
    name: 'Test User',
    createdAt: new Date('2025-08-29T10:00:00Z'),
    updatedAt: new Date('2025-08-29T10:00:00Z'),
    deletedAt: null,
  };

  const mockPayable: PayableEntity = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    value: 1500.75,
    emissionDate: new Date('2024-12-31T00:00:00Z'),
    assignorId: mockAssignor.id,
    createdAt: new Date('2025-08-29T10:00:00Z'),
    updatedAt: new Date('2025-08-29T10:00:00Z'),
    assignor: mockAssignor,
  };

  const mockPrismaService = {
    payable: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaPayableRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaPayableRepository>(PrismaPayableRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find payable by id with assignor', async () => {
      mockPrismaService.payable.findUnique.mockResolvedValue(mockPayable);

      const result = await repository.findById(mockPayable.id);

      expect(mockPrismaService.payable.findUnique).toHaveBeenCalledWith({
        where: { id: mockPayable.id },
        include: {
          assignor: true,
        },
      });
      expect(result).toEqual(mockPayable);
    });

    it('should return null when payable not found', async () => {
      mockPrismaService.payable.findUnique.mockResolvedValue(null);

      const result = await repository.findById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all payables with assignors', async () => {
      const payables = [mockPayable];
      mockPrismaService.payable.findMany.mockResolvedValue(payables);

      const result = await repository.findAll();

      expect(mockPrismaService.payable.findMany).toHaveBeenCalledWith({
        include: {
          assignor: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(payables);
    });
  });

  describe('findAllPaginated', () => {
    it('should find paginated payables with assignors', async () => {
      const payables = [mockPayable];
      mockPrismaService.payable.findMany.mockResolvedValue(payables);

      const result = await repository.findAllPaginated(0, 10);

      expect(mockPrismaService.payable.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          assignor: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(payables);
    });
  });

  describe('count', () => {
    it('should count payables', async () => {
      mockPrismaService.payable.count.mockResolvedValue(3);

      const result = await repository.count();

      expect(mockPrismaService.payable.count).toHaveBeenCalled();
      expect(result).toBe(3);
    });
  });

  describe('create', () => {
    it('should create payable with assignor relation', async () => {
      const createData = {
        id: mockPayable.id,
        value: mockPayable.value,
        emissionDate: mockPayable.emissionDate,
        assignorId: mockPayable.assignorId,
      };
      
      mockPrismaService.payable.create.mockResolvedValue(mockPayable);

      const result = await repository.create(createData);

      expect(mockPrismaService.payable.create).toHaveBeenCalledWith({
        data: createData,
        include: {
          assignor: true,
        },
      });
      expect(result).toEqual(mockPayable);
    });
  });

  describe('update', () => {
    it('should update payable with specified data', async () => {
      const updateData = {
        value: 2000.50,
        emissionDate: new Date('2025-01-15T00:00:00Z'),
      };
      
      const updatedPayable = {
        ...mockPayable,
        value: 2000.50,
        emissionDate: new Date('2025-01-15T00:00:00Z'),
      };
      
      mockPrismaService.payable.update.mockResolvedValue(updatedPayable);

      const result = await repository.update(mockPayable.id, updateData);

      expect(mockPrismaService.payable.update).toHaveBeenCalledWith({
        where: { id: mockPayable.id },
        data: updateData,
        include: {
          assignor: true,
        },
      });
      expect(result).toEqual(updatedPayable);
    });

    it('should update assignor reference', async () => {
      const updateData = {
        assignorId: 'new-assignor-id',
      };
      
      const updatedPayable = {
        ...mockPayable,
        assignorId: 'new-assignor-id',
      };
      
      mockPrismaService.payable.update.mockResolvedValue(updatedPayable);

      const result = await repository.update(mockPayable.id, updateData);

      expect(mockPrismaService.payable.update).toHaveBeenCalledWith({
        where: { id: mockPayable.id },
        data: updateData,
        include: {
          assignor: true,
        },
      });
      expect(result).toEqual(updatedPayable);
    });
  });

  describe('delete', () => {
    it('should delete payable by id', async () => {
      mockPrismaService.payable.delete.mockResolvedValue(mockPayable);

      const result = await repository.delete(mockPayable.id);

      expect(mockPrismaService.payable.delete).toHaveBeenCalledWith({
        where: { id: mockPayable.id },
        include: {
          assignor: true,
        },
      });
      expect(result).toEqual(mockPayable);
    });
  });
});
