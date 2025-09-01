import { Test } from '@nestjs/testing';
import { PayablesConsumer, PAYABLE_QUEUE, PAYABLE_DEAD_QUEUE } from '../../../../src/modules/payables/payables.consumer';
import { PayablesService } from '../../../../src/modules/payables/payables.service';
import { CustomLogger } from '../../../../src/shared/logger/custom-logger.service';
import { EmailService } from '../../../../src/shared/notifications/email.service';
import { getQueueToken } from '@nestjs/bull';

const mockService = { create: jest.fn() } as any;
const mockLogger = { setContext: jest.fn(), setTraceId: jest.fn(), info: jest.fn(), warn: jest.fn() } as any;
const mockEmail = { send: jest.fn() } as any;
const mockDeadQueue = { add: jest.fn().mockResolvedValue(undefined) } as any;

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
  { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
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
  { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
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
  { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
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
  { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
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
  { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
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

  it('OnQueueFailed: quando esgota tentativas, envia para Fila Morta e notifica operações', async () => {
    process.env.OPS_EMAIL = 'ops@example.com';
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn() } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
        { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job: any = {
      id: '42',
      data: { batchId: 'batch-dead', item: { id: 'p-dead' } },
      attemptsMade: 4,
      opts: { attempts: 4 },
      queue: { client: { hincrby: jest.fn().mockResolvedValue(1) } },
    };

    await consumer.onFailed(job as any, new Error('hard fail'));
    expect(job.queue.client.hincrby).toHaveBeenCalledWith('batch:payable:batch-dead', 'failed', 1);
    expect(mockDeadQueue.add).toHaveBeenCalledWith(
      'payable-dead',
      expect.objectContaining({ batchId: 'batch-dead', item: { id: 'p-dead' }, reason: 'hard fail' }),
      expect.any(Object)
    );
    expect(mockEmail.send).toHaveBeenCalledWith(
      'ops@example.com',
      expect.stringContaining('Fila Morta'),
      expect.stringContaining('p-dead')
    );
    await module.close();
  });

  it('OnQueueFailed: retorna cedo quando ainda há tentativas restantes', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn() } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
        { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job: any = {
      id: '11',
      data: { batchId: 'batch-early', item: { id: 'p-early' } },
      attemptsMade: 1,
      opts: { attempts: 4 },
      queue: { client: { hincrby: jest.fn() } },
    };

    await expect(consumer.onFailed(job as any, new Error('fail once'))).resolves.toBeUndefined();
    expect(job.queue.client.hincrby).not.toHaveBeenCalled();
    expect(mockDeadQueue.add).not.toHaveBeenCalled();
    expect(mockEmail.send).not.toHaveBeenCalled();
    await module.close();
  });

  it('OnQueueFailed: captura erro interno e faz warn sem lançar', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn() } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
        { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job: any = {
      id: '99',
      data: { batchId: 'batch-catch', item: { id: 'p-catch' } },
      attemptsMade: 4,
      opts: { attempts: 4 },
      queue: { client: { hincrby: jest.fn().mockRejectedValue(new Error('hincrby boom')) } },
    };

    await expect(consumer.onFailed(job as any, new Error('hard fail'))).resolves.toBeUndefined();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'falha ao tratar dead-letter',
      expect.objectContaining({ error: 'hincrby boom' })
    );
    expect(mockDeadQueue.add).not.toHaveBeenCalled();
    expect(mockEmail.send).not.toHaveBeenCalled();
    await module.close();
  });

  it('OnQueueFailed: sem OPS_EMAIL configurado, não envia email e faz warn', async () => {
    delete process.env.OPS_EMAIL;
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn() } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
        { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job: any = {
      id: '77',
      data: { batchId: 'batch-no-ops', item: { id: 'p-no-ops' } },
      attemptsMade: 4,
      opts: { attempts: 4 },
      queue: { client: { hincrby: jest.fn().mockResolvedValue(1) } },
    };

    await expect(consumer.onFailed(job as any, new Error('hard fail'))).resolves.toBeUndefined();
    expect(mockEmail.send).not.toHaveBeenCalled();
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'OPS_EMAIL não configurado; não foi possível notificar operações',
      expect.objectContaining({ batchId: 'batch-no-ops' })
    );
    await module.close();
  });

  it('OnQueueFailed: usa defaults quando attemptsMade/opts são undefined e retorna cedo', async () => {
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn() } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
        { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job: any = {
      id: '66',
      data: { batchId: 'batch-defaults', item: { id: 'p-defaults' } },
      // attemptsMade undefined -> defaults to 0; opts undefined -> attempts defaults to 1
      queue: { client: { hincrby: jest.fn() } },
    };

    await expect(consumer.onFailed(job as any, new Error('any'))).resolves.toBeUndefined();
    expect(job.queue.client.hincrby).not.toHaveBeenCalled();
    await module.close();
  });

  it("OnQueueFailed: preenche 'unknown' quando error é undefined e envia email", async () => {
    process.env.OPS_EMAIL = 'ops@example.com';
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn() } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
        { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job: any = {
      id: '100',
      data: { batchId: 'batch-unknown', item: { id: 'p-unknown' } },
      attemptsMade: 2,
      opts: { attempts: 2 },
      queue: { client: { hincrby: jest.fn().mockResolvedValue(1) } },
    };

    await consumer.onFailed(job as any, undefined as any);
    expect(mockDeadQueue.add).toHaveBeenCalledWith(
      'payable-dead',
      expect.objectContaining({ reason: 'unknown' }),
      expect.any(Object)
    );
    expect(mockEmail.send).toHaveBeenCalledWith(
      'ops@example.com',
      expect.stringContaining('Fila Morta'),
      expect.any(String)
    );
    await module.close();
  });

  it("OnQueueFailed: corpo usa '(sem id)' quando item.id está ausente", async () => {
    process.env.OPS_EMAIL = 'ops@example.com';
    const module = await Test.createTestingModule({
      providers: [
        PayablesConsumer,
        { provide: PayablesService, useValue: { create: jest.fn() } },
        { provide: CustomLogger, useValue: mockLogger },
        { provide: EmailService, useValue: mockEmail },
        { provide: getQueueToken(PAYABLE_DEAD_QUEUE), useValue: mockDeadQueue },
      ],
    }).compile();

    const consumer = module.get(PayablesConsumer);
    const job: any = {
      id: '101',
      data: { batchId: 'batch-no-id', item: {} },
      attemptsMade: 4,
      opts: { attempts: 4 },
      queue: { client: { hincrby: jest.fn().mockResolvedValue(1) } },
    };

    const err = new Error('bad');
    await consumer.onFailed(job as any, err);
    expect(mockEmail.send).toHaveBeenCalledWith(
      'ops@example.com',
      expect.stringContaining('Fila Morta'),
      expect.stringContaining('(sem id)')
    );
    // also ensure attempts and error message are present in body
    const bodyArg = (mockEmail.send as jest.Mock).mock.calls.pop()[2] as string;
    expect(bodyArg).toEqual(expect.stringContaining('4'));
    expect(bodyArg).toEqual(expect.stringContaining('bad'));
    await module.close();
  });
});
