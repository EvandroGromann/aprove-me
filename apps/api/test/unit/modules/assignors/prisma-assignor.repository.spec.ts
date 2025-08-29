import { Test, TestingModule } from '@nestjs/testing';
import { PrismaAssignorRepository } from '../../../../src/modules/assignors/repositories/prisma-assignor.repository';
import { PrismaService } from '../../../../src/shared/database/prisma.service';
import { AssignorEntity } from '../../../../src/modules/assignors/entities/assignor.entity';

describe('PrismaAssignorRepository', () => {
  let repository: PrismaAssignorRepository;
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

  const mockPrismaService = {
    assignor: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaAssignorRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaAssignorRepository>(PrismaAssignorRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find assignor by id', async () => {
      mockPrismaService.assignor.findUnique.mockResolvedValue(mockAssignor);

      const result = await repository.findById(mockAssignor.id);

      expect(mockPrismaService.assignor.findUnique).toHaveBeenCalledWith({
        where: { 
          id: mockAssignor.id,
          deletedAt: null
        },
      });
      expect(result).toEqual(mockAssignor);
    });

    it('should return null when assignor not found', async () => {
      mockPrismaService.assignor.findUnique.mockResolvedValue(null);

      const result = await repository.findById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all assignors', async () => {
      const assignors = [mockAssignor];
      mockPrismaService.assignor.findMany.mockResolvedValue(assignors);

      const result = await repository.findAll();

      expect(mockPrismaService.assignor.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(assignors);
    });
  });

  describe('findAllPaginated', () => {
    it('should find paginated assignors', async () => {
      const assignors = [mockAssignor];
      mockPrismaService.assignor.findMany.mockResolvedValue(assignors);

      const result = await repository.findAllPaginated(0, 10);

      expect(mockPrismaService.assignor.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(assignors);
    });
  });

  describe('count', () => {
    it('should count assignors', async () => {
      mockPrismaService.assignor.count.mockResolvedValue(5);

      const result = await repository.count();

      expect(mockPrismaService.assignor.count).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
      });
      expect(result).toBe(5);
    });
  });

  describe('create', () => {
    it('should create assignor', async () => {
      const createData = {
        id: mockAssignor.id,
        document: mockAssignor.document,
        email: mockAssignor.email,
        phone: mockAssignor.phone,
        name: mockAssignor.name,
      };
      
      mockPrismaService.assignor.create.mockResolvedValue(mockAssignor);

      const result = await repository.create(createData);

      expect(mockPrismaService.assignor.create).toHaveBeenCalledWith({
        data: createData,
      });
      expect(result).toEqual(mockAssignor);
    });
  });

  describe('update', () => {
    it('should update assignor', async () => {
      const updateData = { name: 'Updated Name' };
      const updatedAssignor = { ...mockAssignor, ...updateData };
      
      mockPrismaService.assignor.update.mockResolvedValue(updatedAssignor);

      const result = await repository.update(mockAssignor.id, updateData);

      expect(mockPrismaService.assignor.update).toHaveBeenCalledWith({
        where: { id: mockAssignor.id },
        data: updateData,
      });
      expect(result).toEqual(updatedAssignor);
    });
  });

  describe('softDelete', () => {
    it('should soft delete assignor', async () => {
      mockPrismaService.assignor.update.mockResolvedValue({
        ...mockAssignor,
        deletedAt: new Date(),
      });

      await repository.softDelete(mockAssignor.id);

      expect(mockPrismaService.assignor.update).toHaveBeenCalledWith({
        where: { id: mockAssignor.id },
        data: {
          deletedAt: expect.any(Date),
        },
      });
    });
  });

  describe('restore', () => {
    it('should restore soft deleted assignor', async () => {
      mockPrismaService.assignor.update.mockResolvedValue(mockAssignor);

      const result = await repository.restore(mockAssignor.id);

      expect(mockPrismaService.assignor.update).toHaveBeenCalledWith({
        where: { id: mockAssignor.id },
        data: {
          deletedAt: null,
        },
      });
      expect(result).toEqual(mockAssignor);
    });
  });

  describe('upsert', () => {
    it('should upsert assignor', async () => {
      const upsertData = {
        id: mockAssignor.id,
        document: mockAssignor.document,
        email: mockAssignor.email,
        phone: mockAssignor.phone,
        name: mockAssignor.name,
      };
      
      mockPrismaService.assignor.upsert.mockResolvedValue(mockAssignor);

      const result = await repository.upsert(upsertData);

      expect(mockPrismaService.assignor.upsert).toHaveBeenCalledWith({
        where: { id: upsertData.id },
        update: {
          document: upsertData.document,
          email: upsertData.email,
          phone: upsertData.phone,
          name: upsertData.name,
          deletedAt: null,
        },
        create: upsertData,
      });
      expect(result).toEqual(mockAssignor);
    });
  });
});
