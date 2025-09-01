import { Processor, Process, OnQueueFailed, InjectQueue } from '@nestjs/bull';
import { Job } from 'bull';
import { PayablesService } from './payables.service';
import { CustomLogger } from '../../shared/logger/custom-logger.service';
import { RequestContextService } from '../../shared/context/request-context.service';
import { EmailService } from '../../shared/notifications/email.service';
import { Queue } from 'bull';

export const PAYABLE_QUEUE = 'payable-batch';
export const PAYABLE_DEAD_QUEUE = 'payable-dead';

interface PayableItemJob {
  batchId: string;
  item: any;
}

@Processor(PAYABLE_QUEUE)
export class PayablesConsumer {
  constructor(
    private readonly payablesService: PayablesService,
    private readonly logger: CustomLogger,
  private readonly email: EmailService,
  @InjectQueue(PAYABLE_DEAD_QUEUE) private readonly deadQueue: Queue,
  ) {
    this.logger.setContext('PayablesConsumer');
  }

  @Process('payable')
  async handle(job: Job<PayableItemJob>): Promise<void> {
    const { batchId, item } = job.data;

    this.logger.setTraceId(batchId);
    RequestContextService.setTraceId(batchId);

    const client = await (job as any).queue.client;
    const key = `batch:payable:${batchId}`;

    try {
      await this.payablesService.create(item);

      await client.hincrby(key, 'completed', 1);
    } catch (err) {
      throw err;
    } finally {
      try {
        const [totalStr, completedStr, failedStr, notifyTo] = await client.hmget(
          key,
          'total', 'completed', 'failed', 'notifyTo'
        );
        const total = parseInt(totalStr || '0', 10);
        const completed = parseInt(completedStr || '0', 10);
        const failed = parseInt(failedStr || '0', 10);

        if (completed + failed >= total && total > 0) {
          const lockKey = `batch:payable:${batchId}:notify:lock`;
          const acquired = await client.set(lockKey, '1', 'NX', 'EX', 60 * 5); // 5 min de lock
          if (acquired && notifyTo) {
            await this.email.send(
              notifyTo,
              `Batch ${batchId} concluído`,
              `Processamento concluído. Sucesso: ${completed}, Falhas: ${failed}, Total: ${total}.`
            );
            this.logger.info('batch notification sent', { batchId, notifyTo, total, completed, failed });
            await client.hset(key, 'notified', '1', 'notifiedAt', new Date().toISOString());
          }
        }
      } catch (err2) {
        this.logger.warn('batch tracker finalize check failed', { error: (err2 as Error).message, batchId });
      }
    }
  }

  @OnQueueFailed()
  async onFailed(job: Job<PayableItemJob>, error: Error) {
    try {
      const attemptsMade = (job.attemptsMade ?? 0);
      const attempts = (job.opts?.attempts ?? 1);
      if (attemptsMade < attempts) {
        return;
      }

      const { batchId } = job.data;
      this.logger.setTraceId(batchId);
      RequestContextService.setTraceId(batchId);

      const client = await (job as any).queue.client;
      const key = `batch:payable:${batchId}`;
      await client.hincrby(key, 'failed', 1);

      await this.deadQueue.add('payable-dead', {
        ...job.data,
        failedAt: new Date().toISOString(),
        reason: error?.message || 'unknown',
      }, {
        removeOnComplete: true,
        removeOnFail: false,
        jobId: `dead:${job.id}`,
      });

      const opsEmail = process.env.OPS_EMAIL;
      if (opsEmail) {
        await this.email.send(
          opsEmail,
          `Item movido para Fila Morta - batch ${batchId}`,
          `O item ${job.data?.item?.id ?? '(sem id)'} falhou após ${attempts} tentativas. Motivo: ${error?.message}`
        );
        this.logger.info('dead-letter notification sent', { batchId, itemId: job.data?.item?.id });
      } else {
        this.logger.warn('OPS_EMAIL não configurado; não foi possível notificar operações', { batchId });
      }
    } catch (e) {
      this.logger.warn('falha ao tratar dead-letter', { error: (e as Error).message });
    }
  }
}
