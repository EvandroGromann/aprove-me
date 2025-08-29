import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AssignorsService } from '../../../../src/modules/assignors/assignors.service';
import { AssignorRepository } from '../../../../src/modules/assignors/repositories/assignor.repository';
import { CreateAssignorDto } from '../../../../src/modules/assignors/dto/create-assignor.dto';
import { UpdateAssignorDto } from '../../../../src/modules/assignors/dto/update-assignor.dto';
import { AssignorEntity } from '../../../../src/modules/assignors/entities/assignor.entity';

describe('AssignorsService', () => {
  let service: AssignorsService;
  let repository: jest.Mocked<AssignorRepository>;

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

  const mockRepository = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    upsert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignorsService,
        {
          provide: AssignorRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AssignorsService>(AssignorsService);
    repository = module.get(AssignorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreateAssignorDto = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      document: '12345678900',
      email: 'test@example.com',
      phone: '11999888777',
      name: 'Test User',
    };

    it('should create a new assignor successfully', async () => {
      repository.findById.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockAssignor);

      const result = await service.create(createDto);

      expect(repository.findById).toHaveBeenCalledWith(createDto.id);
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual({
        id: mockAssignor.id,
        document: mockAssignor.document,
        email: mockAssignor.email,
        phone: mockAssignor.phone,
        name: mockAssignor.name,
        createdAt: mockAssignor.createdAt,
        updatedAt: mockAssignor.updatedAt,
      });
    });

    it('should throw ConflictException when assignor already exists', async () => {
      repository.findById.mockResolvedValue(mockAssignor);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(repository.findById).toHaveBeenCalledWith(createDto.id);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated assignors with default parameters', async () => {
      const assignors = [mockAssignor];
      const total = 1;
      
      repository.findAllPaginated.mockResolvedValue(assignors);
      repository.count.mockResolvedValue(total);

      const result = await service.findAll();

      expect(repository.findAllPaginated).toHaveBeenCalledWith(0, 10);
      expect(repository.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: [{
          id: mockAssignor.id,
          document: mockAssignor.document,
          email: mockAssignor.email,
          phone: mockAssignor.phone,
          name: mockAssignor.name,
          createdAt: mockAssignor.createdAt,
          updatedAt: mockAssignor.updatedAt,
        }],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should return paginated assignors', async () => {
      const assignors = [mockAssignor];
      const total = 1;
      
      repository.findAllPaginated.mockResolvedValue(assignors);
      repository.count.mockResolvedValue(total);

      const result = await service.findAll(1, 10);

      expect(repository.findAllPaginated).toHaveBeenCalledWith(0, 10);
      expect(repository.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: [{
          id: mockAssignor.id,
          document: mockAssignor.document,
          email: mockAssignor.email,
          phone: mockAssignor.phone,
          name: mockAssignor.name,
          createdAt: mockAssignor.createdAt,
          updatedAt: mockAssignor.updatedAt,
        }],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return assignor when found', async () => {
      repository.findById.mockResolvedValue(mockAssignor);

      const result = await service.findOne(mockAssignor.id);

      expect(repository.findById).toHaveBeenCalledWith(mockAssignor.id);
      expect(result).toEqual({
        id: mockAssignor.id,
        document: mockAssignor.document,
        email: mockAssignor.email,
        phone: mockAssignor.phone,
        name: mockAssignor.name,
        createdAt: mockAssignor.createdAt,
        updatedAt: mockAssignor.updatedAt,
      });
    });

    it('should throw NotFoundException when assignor not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('invalid-id');
    });
  });

  describe('update', () => {
    const updateDto: UpdateAssignorDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should update assignor successfully', async () => {
      const updatedAssignor = { ...mockAssignor, ...updateDto };
      
      repository.findById.mockResolvedValue(mockAssignor);
      repository.update.mockResolvedValue(updatedAssignor);

      const result = await service.update(mockAssignor.id, updateDto);

      expect(repository.findById).toHaveBeenCalledWith(mockAssignor.id);
      expect(repository.update).toHaveBeenCalledWith(mockAssignor.id, updateDto);
      expect(result).toEqual({
        id: updatedAssignor.id,
        document: updatedAssignor.document,
        email: updatedAssignor.email,
        phone: updatedAssignor.phone,
        name: updatedAssignor.name,
        createdAt: updatedAssignor.createdAt,
        updatedAt: updatedAssignor.updatedAt,
      });
    });

    it('should throw NotFoundException when assignor not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-id', updateDto)).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('invalid-id');
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft delete assignor successfully', async () => {
      repository.findById.mockResolvedValue(mockAssignor);
      repository.softDelete.mockResolvedValue(undefined);

      await service.remove(mockAssignor.id);

      expect(repository.findById).toHaveBeenCalledWith(mockAssignor.id);
      expect(repository.softDelete).toHaveBeenCalledWith(mockAssignor.id);
    });

    it('should throw NotFoundException when assignor not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('invalid-id')).rejects.toThrow(NotFoundException);
      expect(repository.findById).toHaveBeenCalledWith('invalid-id');
      expect(repository.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('should restore soft deleted assignor successfully', async () => {
      repository.restore.mockResolvedValue(mockAssignor);

      const result = await service.restore(mockAssignor.id);

      expect(repository.restore).toHaveBeenCalledWith(mockAssignor.id);
      expect(result).toEqual({
        id: mockAssignor.id,
        document: mockAssignor.document,
        email: mockAssignor.email,
        phone: mockAssignor.phone,
        name: mockAssignor.name,
        createdAt: mockAssignor.createdAt,
        updatedAt: mockAssignor.updatedAt,
      });
    });
  });
});
