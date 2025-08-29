import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PayablesService } from '../../../../src/modules/payables/payables.service';
import { PayableRepository } from '../../../../src/modules/payables/repositories/payable.repository';
import { AssignorRepository } from '../../../../src/modules/assignors/repositories/assignor.repository';
import { CreatePayableRequestDto } from '../../../../src/modules/payables/dto/create-payable-request.dto';
import { PayableEntity } from '../../../../src/modules/payables/entities/payable.entity';
import { AssignorEntity } from '../../../../src/modules/assignors/entities/assignor.entity';
import { mockLoggerProvider } from '../../../helpers/logger.helper';

describe('PayablesService', () => {
  let service: PayablesService;
  let payableRepository: jest.Mocked<PayableRepository>;
  let assignorRepository: jest.Mocked<AssignorRepository>;

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

  const mockPayableRepository = {
    findById: jest.fn(),
    findAll: jest.fn(),
    findAllPaginated: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  };

  const mockAssignorRepository = {
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
        PayablesService,
        {
          provide: PayableRepository,
          useValue: mockPayableRepository,
        },
        {
          provide: AssignorRepository,
          useValue: mockAssignorRepository,
        },
        mockLoggerProvider,
      ],
    }).compile();

    service = module.get<PayablesService>(PayablesService);
    payableRepository = module.get(PayableRepository);
    assignorRepository = module.get(AssignorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto: CreatePayableRequestDto = {
      id: '550e8400-e29b-41d4-a716-446655440001',
      value: 1500.75,
      emissionDate: '2024-12-31T00:00:00.000Z',
      assignor: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        document: '12345678900',
        email: 'test@example.com',
        phone: '11999888777',
        name: 'Test User',
      },
    };

    it('should create a new payable successfully', async () => {
      payableRepository.findById.mockResolvedValue(null);
      assignorRepository.upsert.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      const result = await service.create(createDto);

      expect(payableRepository.findById).toHaveBeenCalledWith(createDto.id);
      expect(assignorRepository.upsert).toHaveBeenCalledWith(createDto.assignor);
      expect(payableRepository.create).toHaveBeenCalledWith({
        id: createDto.id,
        value: createDto.value,
        emissionDate: new Date(createDto.emissionDate),
        assignorId: createDto.assignor.id,
      });
      expect(result).toEqual({
        id: mockPayable.id,
        value: mockPayable.value,
        emissionDate: mockPayable.emissionDate,
        assignor: {
          id: mockAssignor.id,
          document: mockAssignor.document,
          email: mockAssignor.email,
          phone: mockAssignor.phone,
          name: mockAssignor.name,
        },
        createdAt: mockPayable.createdAt,
        updatedAt: mockPayable.updatedAt,
      });
    });

    it('should throw ConflictException when payable already exists', async () => {
      payableRepository.findById.mockResolvedValue(mockPayable);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(payableRepository.findById).toHaveBeenCalledWith(createDto.id);
      expect(assignorRepository.upsert).not.toHaveBeenCalled();
      expect(payableRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated payables with default parameters', async () => {
      const payables = [mockPayable];
      const total = 1;
      
      payableRepository.findAllPaginated.mockResolvedValue(payables);
      payableRepository.count.mockResolvedValue(total);

      const result = await service.findAll();

      expect(payableRepository.findAllPaginated).toHaveBeenCalledWith(0, 10);
      expect(payableRepository.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: [{
          id: mockPayable.id,
          value: mockPayable.value,
          emissionDate: mockPayable.emissionDate,
          assignor: {
            id: mockAssignor.id,
            document: mockAssignor.document,
            email: mockAssignor.email,
            phone: mockAssignor.phone,
            name: mockAssignor.name,
          },
          createdAt: mockPayable.createdAt,
          updatedAt: mockPayable.updatedAt,
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

    it('should return paginated payables', async () => {
      const payables = [mockPayable];
      const total = 1;
      
      payableRepository.findAllPaginated.mockResolvedValue(payables);
      payableRepository.count.mockResolvedValue(total);

      const result = await service.findAll(1, 10);

      expect(payableRepository.findAllPaginated).toHaveBeenCalledWith(0, 10);
      expect(payableRepository.count).toHaveBeenCalled();
      expect(result).toEqual({
        data: [{
          id: mockPayable.id,
          value: mockPayable.value,
          emissionDate: mockPayable.emissionDate,
          assignor: {
            id: mockAssignor.id,
            document: mockAssignor.document,
            email: mockAssignor.email,
            phone: mockAssignor.phone,
            name: mockAssignor.name,
          },
          createdAt: mockPayable.createdAt,
          updatedAt: mockPayable.updatedAt,
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
    it('should return payable when found', async () => {
      payableRepository.findById.mockResolvedValue(mockPayable);

      const result = await service.findOne(mockPayable.id);

      expect(payableRepository.findById).toHaveBeenCalledWith(mockPayable.id);
      expect(result).toEqual({
        id: mockPayable.id,
        value: mockPayable.value,
        emissionDate: mockPayable.emissionDate,
        assignor: {
          id: mockAssignor.id,
          document: mockAssignor.document,
          email: mockAssignor.email,
          phone: mockAssignor.phone,
          name: mockAssignor.name,
        },
        createdAt: mockPayable.createdAt,
        updatedAt: mockPayable.updatedAt,
      });
    });

    it('should throw NotFoundException when payable not found', async () => {
      payableRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
      expect(payableRepository.findById).toHaveBeenCalledWith('invalid-id');
    });
  });
});
