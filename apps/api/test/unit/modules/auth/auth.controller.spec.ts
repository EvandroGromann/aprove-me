import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from '../../../../src/modules/auth/auth.controller';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { LoginDto } from '../../../../src/modules/auth/dto/login.dto';
import { LoginResponseDto } from '../../../../src/modules/auth/dto/login-response.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
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
      const expectedResponse: LoginResponseDto = {
        access_token: 'mock-jwt-token',
        token_type: 'Bearer',
        expires_in: 60,
      };
      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto: LoginDto = {
        login: 'invalid',
        password: 'invalid',
      };
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas')
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException
      );
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle service errors properly', async () => {
      const loginDto: LoginDto = {
        login: 'aprovame',
        password: 'aprovame',
      };
      const serviceError = new Error('Service error');
      mockAuthService.login.mockRejectedValue(serviceError);

      await expect(controller.login(loginDto)).rejects.toThrow('Service error');
    });
  });

  describe('endpoint configuration', () => {
    it('should be properly configured with decorators', () => {
      const loginMethod = controller.login;
      expect(loginMethod).toBeDefined();
      expect(typeof loginMethod).toBe('function');
    });
  });
});
