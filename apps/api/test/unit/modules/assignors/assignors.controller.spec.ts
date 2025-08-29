import { Test, TestingModule } from '@nestjs/testing';
import { AssignorsController } from '../../../../src/modules/assignors/assignors.controller';
import { AssignorsService } from '../../../../src/modules/assignors/assignors.service';
import { CreateAssignorDto } from '../../../../src/modules/assignors/dto/create-assignor.dto';
import { UpdateAssignorDto } from '../../../../src/modules/assignors/dto/update-assignor.dto';
import { AssignorResponseDto } from '../../../../src/modules/assignors/dto/assignor-response.dto';

describe('AssignorsController', () => {
  let controller: AssignorsController;
  let service: jest.Mocked<AssignorsService>;

  const mockAssignorResponse: AssignorResponseDto = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    document: '12345678900',
    email: 'test@example.com',
    phone: '11999888777',
    name: 'Test User',
    createdAt: new Date('2025-08-29T10:00:00Z'),
    updatedAt: new Date('2025-08-29T10:00:00Z'),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignorsController],
      providers: [
        {
          provide: AssignorsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<AssignorsController>(AssignorsController);
    service = module.get(AssignorsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new assignor', async () => {
      const createDto: CreateAssignorDto = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      };

      service.create.mockResolvedValue(mockAssignorResponse);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockAssignorResponse);
    });
  });

  describe('findAll', () => {
    it('should return paginated assignors with default pagination', async () => {
      const paginatedResult = {
        data: [mockAssignorResponse],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginatedResult);
    });

    it('should return paginated assignors with custom pagination', async () => {
      const paginatedResult = {
        data: [mockAssignorResponse],
        meta: {
          page: 2,
          limit: 5,
          total: 10,
          totalPages: 2,
          hasNext: false,
          hasPrev: true,
        },
      };

      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('2', '5');

      expect(service.findAll).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual(paginatedResult);
    });

    it('should handle invalid pagination parameters', async () => {
      const paginatedResult = {
        data: [mockAssignorResponse],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      service.findAll.mockResolvedValue(paginatedResult);

      const result = await controller.findAll('invalid', 'invalid');

      expect(service.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(paginatedResult);
    });
  });

  describe('findOne', () => {
    it('should return a single assignor', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      
      service.findOne.mockResolvedValue(mockAssignorResponse);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockAssignorResponse);
    });
  });

  describe('update', () => {
    it('should update an assignor', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const updateDto: UpdateAssignorDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };
      const updatedResponse = { ...mockAssignorResponse, ...updateDto };

      service.update.mockResolvedValue(updatedResponse);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(updatedResponse);
    });
  });

  describe('remove', () => {
    it('should remove an assignor', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toBeUndefined();
    });
  });

  describe('restore', () => {
    it('should restore a deleted assignor', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      
      service.restore.mockResolvedValue(mockAssignorResponse);

      const result = await controller.restore(id);

      expect(service.restore).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockAssignorResponse);
    });
  });
});
