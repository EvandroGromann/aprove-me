import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../../../src/modules/users/users.service';
import { UsersRepository } from '../../../../src/modules/users/repositories/users.repository';
import { CreateUserDto, UpdateUserDto } from '../../../../src/modules/users/dto';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { createMockLogger } from '../../../helpers/logger.helper';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  let logger: any;

  const mockUsersRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByLogin: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    logger = createMockLogger();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: CustomLogger,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);

    mockBcrypt.hash.mockResolvedValue('hashed-password' as never);
    mockBcrypt.compare.mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        login: 'testuser',
        password: 'password123',
      };

      const createdUser = {
        id: 'test-id',
        login: 'testuser',
        password: 'hashed-password',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findByLogin.mockResolvedValue(null);
      mockUsersRepository.create.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(mockUsersRepository.findByLogin).toHaveBeenCalledWith('testuser');
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        login: 'testuser',
        password: 'hashed-password',
      });
      expect(result).toEqual({
        id: 'test-id',
        login: 'testuser',
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      });
    });

    it('should throw ConflictException if login already exists', async () => {
      const createUserDto: CreateUserDto = {
        login: 'existinguser',
        password: 'password123',
      };

      const existingUser = {
        id: 'existing-id',
        login: 'existinguser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findByLogin.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException('Login já existe'),
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
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

      mockUsersRepository.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockUsersRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty('password');
      expect(result[0]).toEqual({
        id: '1',
        login: 'user1',
        createdAt: users[0].createdAt,
        updatedAt: users[0].updatedAt,
      });
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 'test-id',
        login: 'testuser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findById.mockResolvedValue(user);

      const result = await service.findById('test-id');

      expect(mockUsersRepository.findById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({
        id: 'test-id',
        login: 'testuser',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const updateUserDto: UpdateUserDto = {
        login: 'updateduser',
        password: 'newpassword',
      };

      const existingUser = {
        id: 'test-id',
        login: 'testuser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        login: 'updateduser',
        password: 'hashed-password',
      };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.findByLogin.mockResolvedValue(null);
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('test-id', updateUserDto);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUsersRepository.update).toHaveBeenCalledWith('test-id', {
        login: 'updateduser',
        password: 'hashed-password',
      });
      expect(result).toEqual({
        id: 'test-id',
        login: 'updateduser',
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    });

    it('should update user without login change', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'newpassword',
      };

      const existingUser = {
        id: 'test-id',
        login: 'testuser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        password: 'hashed-password',
      };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('test-id', updateUserDto);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
      expect(mockUsersRepository.findByLogin).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 'test-id',
        login: 'testuser',
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    });

    it('should update user without password change', async () => {
      const updateUserDto: UpdateUserDto = {
        login: 'updateduser',
      };

      const existingUser = {
        id: 'test-id',
        login: 'testuser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        login: 'updateduser',
      };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.findByLogin.mockResolvedValue(null);
      mockUsersRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('test-id', updateUserDto);

      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersRepository.update).toHaveBeenCalledWith('test-id', {
        login: 'updateduser',
      });
      expect(result).toEqual({
        id: 'test-id',
        login: 'updateduser',
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { login: 'test' }),
      ).rejects.toThrow(new NotFoundException('Usuário não encontrado'));
    });

    it('should throw ConflictException if login already exists for another user', async () => {
      const existingUser = {
        id: 'test-id',
        login: 'testuser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const anotherUser = {
        id: 'another-id',
        login: 'newlogin',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findById.mockResolvedValue(existingUser);
      mockUsersRepository.findByLogin.mockResolvedValue(anotherUser);

      await expect(
        service.update('test-id', { login: 'newlogin' }),
      ).rejects.toThrow(new ConflictException('Login já existe'));
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const user = {
        id: 'test-id',
        login: 'testuser',
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findById.mockResolvedValue(user);
      mockUsersRepository.delete.mockResolvedValue({
        ...user,
        deletedAt: new Date(),
      });

      await service.remove('test-id');

      expect(mockUsersRepository.findById).toHaveBeenCalledWith('test-id');
      expect(mockUsersRepository.delete).toHaveBeenCalledWith('test-id');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        new NotFoundException('Usuário não encontrado'),
      );
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const user = { password: 'hashed-password' };
      mockBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validatePassword(user, 'password');

      expect(mockBcrypt.compare).toHaveBeenCalledWith('password', 'hashed-password');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      const user = { password: 'hashed-password' };
      mockBcrypt.compare.mockResolvedValue(false as never);

      const result = await service.validatePassword(user, 'wrongpassword');

      expect(result).toBe(false);
    });
  });

  describe('findByLogin', () => {
    it('should return user by login', async () => {
      const login = 'testuser';
      const expectedUser = {
        id: 'test-id',
        login,
        password: 'hash',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findByLogin.mockResolvedValue(expectedUser);

      const result = await service.findByLogin(login);

      expect(mockUsersRepository.findByLogin).toHaveBeenCalledWith(login);
      expect(result).toEqual(expectedUser);
    });

    it('should return null if user not found by login', async () => {
      const login = 'nonexistent';
      mockUsersRepository.findByLogin.mockResolvedValue(null);

      const result = await service.findByLogin(login);

      expect(result).toBeNull();
    });
  });
});
