import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { UsersRepository } from '../../../../src/modules/users/repositories/users.repository';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { createMockLogger } from '../../../helpers/logger.helper';

describe('AuthService Quick Test', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;
  let logger: any;

  beforeEach(async () => {
    logger = createMockLogger();
    
    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockUsersRepository = {
      findByLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: CustomLogger, useValue: logger },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
  });

  it('should throw UnauthorizedException when jwt.verify throws', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('Token verification failed');
    });

    await expect(service.validateToken('invalid-token')).rejects.toThrow(
      UnauthorizedException
    );
    
    expect(logger.security).toHaveBeenCalledWith(
      'Token validation failed',
      expect.objectContaining({
        error: 'Token verification failed',
        tokenPrefix: 'invalid-to...'
      })
    );
  });

  it('should handle empty token in error logging', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('Empty token');
    });

    await expect(service.validateToken('')).rejects.toThrow(
      UnauthorizedException
    );
    
    expect(logger.security).toHaveBeenCalledWith(
      'Token validation failed',
      expect.objectContaining({
        error: 'Empty token',
        tokenPrefix: 'empty'
      })
    );
  });

  it('should handle null token in error logging', async () => {
    jwtService.verify.mockImplementation(() => {
      throw new Error('Null token');
    });

    await expect(service.validateToken(null as any)).rejects.toThrow(
      UnauthorizedException
    );
    
    expect(logger.security).toHaveBeenCalledWith(
      'Token validation failed',
      expect.objectContaining({
        error: 'Null token',
        tokenPrefix: 'empty'
      })
    );
  });
});
