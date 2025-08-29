import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../../src/shared/auth/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new JwtAuthGuard();
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          headers: { authorization: 'Bearer valid-token' },
        }),
      }),
    } as any;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should call super.canActivate', () => {
    const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
    superCanActivateSpy.mockReturnValue(true);

    const result = guard.canActivate(mockExecutionContext);

    expect(superCanActivateSpy).toHaveBeenCalledWith(mockExecutionContext);
    expect(result).toBe(true);

    superCanActivateSpy.mockRestore();
  });

  it('should return the result from super.canActivate', () => {
    const superCanActivateSpy = jest.spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate');
    superCanActivateSpy.mockReturnValue(false);

    const result = guard.canActivate(mockExecutionContext);

    expect(result).toBe(false);

    superCanActivateSpy.mockRestore();
  });
});
