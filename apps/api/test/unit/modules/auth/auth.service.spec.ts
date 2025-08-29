import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { UsersRepository } from '../../../../src/modules/users/repositories/users.repository';
import { LoginDto } from '../../../../src/modules/auth/dto/login.dto';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { createMockLogger } from '../../../helpers/logger.helper';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersRepository: UsersRepository;
  let logger: any;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockUsersRepository = {
    findByLogin: jest.fn(),
  };

  beforeEach(async () => {
    logger = createMockLogger();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
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

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get<UsersRepository>(UsersRepository);

    mockBcrypt.compare.mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      const loginDto: LoginDto = {
        login: 'testuser',
        password: 'password123',
      };
      
      const mockUser = {
        id: 'user-id',
        login: 'testuser',
        password: 'hashed-password',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const mockToken = 'mock-jwt-token';
      
      mockUsersRepository.findByLogin.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(mockUsersRepository.findByLogin).toHaveBeenCalledWith('testuser');
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toEqual({
        access_token: mockToken,
        token_type: 'Bearer',
        expires_in: 60,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: 'user-id',
          login: 'testuser',
        },
        { expiresIn: '1m' }
      );

      // Verify logging calls
      expect(logger.log).toHaveBeenCalledWith('Login attempt for user: testuser');
      expect(logger.audit).toHaveBeenCalledWith(
        'User login successful',
        {
          userId: 'user-id',
          login: 'testuser',
          tokenExpiry: '1m'
        },
        'user-id'
      );
      expect(logger.performance).toHaveBeenCalledWith(
        'Login process',
        expect.any(Number),
        {
          userId: 'user-id',
          success: true
        }
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const loginDto: LoginDto = {
        login: 'nonexistent',
        password: 'password123',
      };

      mockUsersRepository.findByLogin.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas'
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();

      // Verify security logging
      expect(logger.security).toHaveBeenCalledWith(
        'Login failed - user not found',
        { login: 'nonexistent', ip: 'unknown' }
      );
      expect(logger.performance).toHaveBeenCalledWith(
        'Login process',
        expect.any(Number),
        {
          success: false,
          error: 'Credenciais inválidas'
        }
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto: LoginDto = {
        login: 'testuser',
        password: 'wrongpassword',
      };
      
      const mockUser = {
        id: 'user-id',
        login: 'testuser',
        password: 'hashed-password',
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersRepository.findByLogin.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas'
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should return decoded payload for valid token', async () => {
      const token = 'valid-token';
      const mockPayload = { sub: 'user-id', login: 'testuser' };
      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = await service.validateToken(token);

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const token = 'invalid-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.validateToken(token)).rejects.toThrow(
        'Token inválido ou expirado'
      );
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const token = 'expired-token';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException for null token', async () => {
      const token = null as any;
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token is null');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.validateToken(token)).rejects.toThrow(
        'Token inválido ou expirado'
      );
    });

    it('should throw UnauthorizedException for empty token', async () => {
      const token = '';
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token is empty');
      });

      await expect(service.validateToken(token)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.validateToken(token)).rejects.toThrow(
        'Token inválido ou expirado'
      );
    });
  });
});
