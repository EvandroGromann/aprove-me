import { Test, TestingModule } from '@nestjs/testing';
import { PayablesController } from '../../../../src/modules/payables/payables.controller';
import { PayablesService } from '../../../../src/modules/payables/payables.service';
import { CreatePayableRequestDto } from '../../../../src/modules/payables/dto/create-payable-request.dto';
import { PayableResponseDto } from '../../../../src/modules/payables/dto/payable-response.dto';

describe('PayablesController', () => {
  let controller: PayablesController;
  let service: jest.Mocked<PayablesService>;

  const mockPayableResponse: PayableResponseDto = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    value: 1500.75,
    emissionDate: new Date('2024-12-31T00:00:00Z'),
    assignor: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      document: '12345678900',
      email: 'test@example.com',
      phone: '11999888777',
      name: 'Test User',
    },
    createdAt: new Date('2025-08-29T10:00:00Z'),
    updatedAt: new Date('2025-08-29T10:00:00Z'),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    enqueueBatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayablesController],
      providers: [
        {
          provide: PayablesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PayablesController>(PayablesController);
    service = module.get(PayablesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new payable', async () => {
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

      service.create.mockResolvedValue(mockPayableResponse);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPayableResponse);
    });
  });

  describe('findAll', () => {
    it('should return paginated payables with default pagination', async () => {
      const paginatedResult = {
        data: [mockPayableResponse],
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

    it('should return paginated payables with custom pagination', async () => {
      const paginatedResult = {
        data: [mockPayableResponse],
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
        data: [mockPayableResponse],
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
    it('should return a single payable', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440001';
      
      service.findOne.mockResolvedValue(mockPayableResponse);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPayableResponse);
    });
  });

  describe('enqueueBatch', () => {
    it('should delegate to service.enqueueBatch and return { batchId }', async () => {
      const body = {
        items: [
          {
            id: 'p1',
            value: 100,
            emissionDate: '2025-08-30T00:00:00.000Z',
            assignor: {
              id: 'a1',
              document: '12345678900',
              email: 'u@e.com',
              phone: '11999999999',
              name: 'User',
            },
          },
        ],
        notifyTo: 'ops@example.com',
      } as any;

      service.enqueueBatch.mockResolvedValue({ batchId: 'batch-123' });

      const result = await controller.enqueueBatch(body);

      expect(service.enqueueBatch).toHaveBeenCalledWith(body.items, body.notifyTo);
      expect(result).toEqual({ batchId: 'batch-123' });
    });
  });

  describe('update', () => {
    it('should update a payable and return the updated entity', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440001';
      const updateDto = {
        value: 2000,
        emissionDate: '2025-01-15T00:00:00.000Z',
      };
      
      const updatedPayable = {
        ...mockPayableResponse,
        value: 2000,
        emissionDate: new Date('2025-01-15T00:00:00.000Z'),
      };
      
      service.update.mockResolvedValue(updatedPayable);

      const result = await controller.update(id, updateDto);

      expect(service.update).toHaveBeenCalledWith(id, updateDto);
      expect(result).toEqual(updatedPayable);
    });
  });

  describe('remove', () => {
    it('should call service.remove with the correct id', async () => {
      const id = '550e8400-e29b-41d4-a716-446655440001';
      
      service.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
