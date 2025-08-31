import { Test } from '@nestjs/testing';
import { PayablesConsumer, PAYABLE_QUEUE } from '../../../../src/modules/payables/payables.consumer';
import { PayablesService } from '../../../../src/modules/payables/payables.service';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { EmailService } from '../../../../src/shared/notifications/email.service';

const mockService = { create: jest.fn() } as any;
const mockLogger = { setContext: jest.fn(), setTraceId: jest.fn(), info: jest.fn(), warn: jest.fn() } as any;
const mockEmail = { send: jest.fn() } as any;

function makeJob(data: any) {
  return {
    data,
    queue: {
      client: {
        hincrby: jest.fn().mockResolvedValue(1),
        hmget: jest.fn().mockResolvedValue(['2', '1', '1', 'ops@example.com']),
        hset: jest.fn().mockResolvedValue('OK'),
        set: jest.fn().mockResolvedValue('OK'),
      },
    },
  } as any;
}

describe('PayablesConsumer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('processa item com sucesso e envia notificação quando batch conclui', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: mockService },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job = makeJob({ batchId: 'batch-1', item: { id: 'p1' } });

  await consumer.handle(job);

    expect(mockService.create).toHaveBeenCalledWith({ id: 'p1' });
    expect(mockEmail.send).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('batch notification sent', expect.any(Object));
  await module.close();
  });

  it('marca falha e repropaga erro quando create falha', async () => {
  const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn().mockRejectedValue(new Error('boom')) } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job = makeJob({ batchId: 'batch-1', item: { id: 'p2' } });

  await expect(consumer.handle(job)).rejects.toThrow('boom');
  await module.close();
  });

  it('faz warn quando verificação final do tracker falha (hmget lança erro)', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job = makeJob({ batchId: 'batch-err', item: { id: 'p3' } });
    // Force hmget to throw inside finalize check
    (job as any).queue.client.hmget = jest.fn().mockRejectedValue(new Error('hmget fail'));

    await expect(consumer.handle(job)).resolves.toBeUndefined();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'batch tracker finalize check failed',
      expect.objectContaining({ error: 'hmget fail', batchId: 'batch-err' })
    );
    await module.close();
  });

  it('não envia email quando notifyTo é vazio (branch acquired && notifyTo falso)', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job = makeJob({ batchId: 'batch-no-notify', item: { id: 'p4' } });
    // completed + failed == total, but notifyTo is empty -> should not send
    (job as any).queue.client.hmget = jest.fn().mockResolvedValue(['1', '1', '0', '']);

    await consumer.handle(job);
    expect(mockEmail.send).not.toHaveBeenCalled();
    await module.close();
  });

  it('faz parse com fallback "0" quando hmget retorna undefined e não notifica com total=0', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn().mockResolvedValue(undefined) } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job = makeJob({ batchId: 'batch-fallback', item: { id: 'p5' } });
    // hmget returns undefineds -> parseInt(... || '0')
    (job as any).queue.client.hmget = jest.fn().mockResolvedValue([undefined, undefined, undefined, 'ops@example.com']);

    await consumer.handle(job);
    // total parsed to 0 should skip notification path
    expect(mockEmail.send).not.toHaveBeenCalled();
    await module.close();
  });
});
