import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from '../../../../../src/shared/auth/strategies/jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtStrategy],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  describe('validate', () => {
    it('should return user object for valid payload', async () => {
      const payload: JwtPayload = {
        sub: '1',
        login: 'aprovame',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: '1',
        login: 'aprovame',
      });
    });

    it('should return user object without optional fields', async () => {
      const payload: JwtPayload = {
        sub: '123',
        login: 'testuser',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: '123',
        login: 'testuser',
      });
    });

    it('should handle different user IDs', async () => {
      const payload: JwtPayload = {
        sub: 'uuid-123-456',
        login: 'anotheruser',
        iat: 1234567890,
        exp: 1234567950,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 'uuid-123-456',
        login: 'anotheruser',
      });
      expect(result.userId).toBe(payload.sub);
      expect(result.login).toBe(payload.login);
    });
  });

  describe('strategy configuration', () => {
    it('should be properly configured', () => {
      expect(strategy).toBeDefined();
      expect(strategy.validate).toBeDefined();
      expect(typeof strategy.validate).toBe('function');
    });
  });
});
