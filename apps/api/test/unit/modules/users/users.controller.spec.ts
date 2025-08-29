import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../../src/modules/users/users.controller';
import { UsersService } from '../../../../src/modules/users/users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../../../src/modules/users/dto';
import { JwtAuthGuard } from '../../../../src/shared/auth/guards/jwt-auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
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

      const expectedResponse: UserResponseDto = {
        id: 'test-id',
        login: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedResponse);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedUsers: UserResponseDto[] = [
        {
          id: '1',
          login: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          login: 'user2',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const expectedUser: UserResponseDto = {
        id: 'test-id',
        login: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findById.mockResolvedValue(expectedUser);

      const result = await controller.findOne('test-id');

      expect(mockUsersService.findById).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(expectedUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        login: 'updateduser',
      };

      const expectedUser: UserResponseDto = {
        id: 'test-id',
        login: 'updateduser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update('test-id', updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith('test-id', updateUserDto);
      expect(result).toEqual(expectedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('test-id');

      expect(mockUsersService.remove).toHaveBeenCalledWith('test-id');
      expect(result).toBeUndefined();
    });
  });
});
