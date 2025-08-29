import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { LoginDto } from '../../../../src/modules/auth/dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      const loginDto: LoginDto = {
        login: 'aprovame',
        password: 'aprovame',
      };
      const mockToken = 'mock-jwt-token';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: mockToken,
        token_type: 'Bearer',
        expires_in: 60,
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: '1',
          login: 'aprovame',
        },
        { expiresIn: '1m' }
      );
    });

    it('should throw UnauthorizedException for invalid login', async () => {
      const loginDto: LoginDto = {
        login: 'invalid',
        password: 'aprovame',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas'
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto: LoginDto = {
        login: 'aprovame',
        password: 'invalid',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciais inválidas'
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for both invalid credentials', async () => {
      const loginDto: LoginDto = {
        login: 'invalid',
        password: 'invalid',
      };

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should return decoded payload for valid token', async () => {
      const token = 'valid-token';
      const mockPayload = { sub: '1', login: 'aprovame' };
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
  });
});
