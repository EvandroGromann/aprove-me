import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AssignorsModule } from '../../src/modules/assignors/assignors.module';
import { PayablesModule } from '../../src/modules/payables/payables.module';

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
});
