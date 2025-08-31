import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { PayablesService } from '../../../../src/modules/payables/payables.service';
import { PayableRepository } from '../../../../src/modules/payables/repositories/payable.repository';
import { AssignorRepository } from '../../../../src/modules/assignors/repositories/assignor.repository';
import { CreatePayableRequestDto } from '../../../../src/modules/payables/dto/create-payable-request.dto';
import { PayableEntity } from '../../../../src/modules/payables/entities/payable.entity';
import { AssignorEntity } from '../../../../src/modules/assignors/entities/assignor.entity';
import { mockLoggerProvider } from '../../../helpers/logger.helper';
import { getQueueToken } from '@nestjs/bull';
import { RequestContextService } from '../../../../src/shared/context/request-context.service';
jest.mock('uuid', () => ({ v4: () => 'uuid-mock-123' }));

describe('PayablesService', () => {
  let service: PayablesService;
  let payableRepository: jest.Mocked<PayableRepository>;
  let assignorRepository: jest.Mocked<AssignorRepository>;
  const mockQueue = {
    addBulk: jest.fn().mockResolvedValue(undefined),
    client: {
      hset: jest.fn().mockResolvedValue('OK'),
      expire: jest.fn().mockResolvedValue(1),
    },
  } as any;

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
        {
          provide: getQueueToken('payable-batch'),
          useValue: mockQueue,
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

  describe('enqueueBatch', () => {
    it('deve publicar um job por item e usar o traceId como batchId', async () => {
      jest.spyOn(RequestContextService, 'getTraceId').mockReturnValue('trace-ctx-123');
      const items: CreatePayableRequestDto[] = [
        {
          id: 'id-1',
          value: 100,
          emissionDate: '2025-08-30T00:00:00.000Z',
          assignor: { id: 'a1', document: 'doc', email: 'e@e.com', phone: '1', name: 'n' },
        },
        {
          id: 'id-2',
          value: 200,
          emissionDate: '2025-08-30T00:00:00.000Z',
          assignor: { id: 'a2', document: 'doc', email: 'e@e.com', phone: '1', name: 'n' },
        },
      ];

      const result = await service.enqueueBatch(items, 'ops@example.com');

      expect(result.batchId).toBe('trace-ctx-123');
      expect(mockQueue.addBulk).toHaveBeenCalledTimes(1);
      const jobsArg = mockQueue.addBulk.mock.calls[0][0];
      expect(jobsArg).toHaveLength(2);
      expect(jobsArg[0]).toMatchObject({
        name: 'payable',
        data: { batchId: 'trace-ctx-123', item: items[0] },
        opts: { jobId: 'trace-ctx-123:id-1' },
      });
      expect(jobsArg[1]).toMatchObject({
        name: 'payable',
        data: { batchId: 'trace-ctx-123', item: items[1] },
        opts: { jobId: 'trace-ctx-123:id-2' },
      });

      expect(mockQueue.client.hset).toHaveBeenCalled();
      const key = mockQueue.client.hset.mock.calls[0][0];
      expect(key).toBe('batch:payable:trace-ctx-123');
    });

    it('deve usar uuid quando não houver traceId', async () => {
      jest.spyOn(RequestContextService, 'getTraceId').mockReturnValue(undefined);
      const items: CreatePayableRequestDto[] = [
        {
          id: 'idx',
          value: 100,
          emissionDate: '2025-08-30T00:00:00.000Z',
          assignor: { id: 'ax', document: 'doc', email: 'e@e.com', phone: '1', name: 'n' },
        },
      ];
      const result = await service.enqueueBatch(items, 'ops@example.com');
      expect(result.batchId).toBe('uuid-mock-123');
      const jobsArg = mockQueue.addBulk.mock.calls.pop()[0];
      expect(jobsArg[0].opts.jobId).toBe('uuid-mock-123:idx');
    });
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
