import { Test, TestingModule } from '@nestjs/testing';
import { UsersRepository } from '../../../../src/modules/users/repositories/users.repository';
import { PrismaService } from '../../../../src/shared/database/prisma.service';
import { CreateUserDto, UpdateUserDto } from '../../../../src/modules/users/dto';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'password123',
      };

      const expectedUser = {
        id: 'generated-id',
        login: 'testuser',
        password: 'password123',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await repository.create(createUserDto);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          ...createUserDto,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('findAll', () => {
    it('should return all non-deleted users', async () => {
      const expectedUsers = [
        {
          id: '1',
          login: 'user1',
          password: 'hash1',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          login: 'user2',
          password: 'hash2',
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await repository.findAll();

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const userId = 'test-id';
      const expectedUser = {
        id: userId,
        login: 'testuser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(expectedUser);

      const result = await repository.findById(userId);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          id: userId,
          deletedAt: null,
        },
      });
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found', async () => {
      const userId = 'non-existent-id';

      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await repository.findById(userId);

      expect(result).toBeNull();
    });
  });

  describe('findByLogin', () => {
    it('should return a user by login', async () => {
      const login = 'testuser';
      const expectedUser = {
        id: 'test-id',
        login,
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(expectedUser);

      const result = await repository.findByLogin(login);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          login,
          deletedAt: null,
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 'test-id';
      const updateUserDto: UpdateUserDto = {
        login: 'updateduser',
      };

      const expectedUser = {
        id: userId,
        login: 'updateduser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await repository.update(userId, updateUserDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe('delete', () => {
    it('should soft delete a user', async () => {
      const userId = 'test-id';
      const expectedUser = {
        id: userId,
        login: 'testuser',
        password: 'hash',
        deletedAt: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await repository.delete(userId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          deletedAt: expect.any(Date),
        },
      });
      expect(result).toEqual(expectedUser);
    });
  });
});
