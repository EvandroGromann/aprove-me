import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AssignorsModule } from '../../src/modules/assignors/assignors.module';
import { PayablesModule } from '../../src/modules/payables/payables.module';
import { RequestLoggingMiddleware } from '../../src/shared/logger/request-logging.middleware';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import AssignorsModule', () => {
    const assignorsModule = module.get(AssignorsModule);
    expect(assignorsModule).toBeDefined();
  });

  it('should import PayablesModule', () => {
    const payablesModule = module.get(PayablesModule);
    expect(payablesModule).toBeDefined();
  });

  it('should compile successfully', async () => {
    await expect(module.init()).resolves.not.toThrow();
  });

  it('should register RequestLoggingMiddleware for all routes in configure()', () => {
    const appModule = new AppModule();
    const forRoutes = jest.fn();
    const apply = jest.fn().mockReturnValue({ forRoutes });
    const consumerMock = { apply } as any; // cast para MiddlewareConsumer

    appModule.configure(consumerMock);

    expect(apply).toHaveBeenCalledWith(RequestLoggingMiddleware);
    expect(forRoutes).toHaveBeenCalledWith('*');
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });
});
