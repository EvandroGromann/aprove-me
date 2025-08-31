import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { PayablesService } from './payables.service';
import { CustomLogger } from '../../shared/logger/custom-logger.service';
import { RequestContextService } from '../../shared/context/request-context.service';
import { EmailService } from '../../shared/notifications/email.service';

export const PAYABLE_QUEUE = 'payable-batch';

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
      // Processar item
      await this.payablesService.create(item);
      // Marcar como concluído
      await client.hincrby(key, 'completed', 1);
    } catch (err) {
      // Marcar falha e propagar para o Bull registrar o erro do job
      await client.hincrby(key, 'failed', 1);
      throw err;
    } finally {
      // Verificar se o batch foi concluído (com sucesso + falhas)
      try {
        const [totalStr, completedStr, failedStr, notifyTo] = await client.hmget(
          key,
          'total', 'completed', 'failed', 'notifyTo'
        );
        const total = parseInt(totalStr || '0', 10);
        const completed = parseInt(completedStr || '0', 10);
        const failed = parseInt(failedStr || '0', 10);

        if (completed + failed >= total && total > 0) {
          // Tentar lock único por batch para notificação
          const lockKey = `batch:payable:${batchId}:notify:lock`;
          const acquired = await client.set(lockKey, '1', 'NX', 'EX', 60 * 5); // 5 min de lock
          if (acquired && notifyTo) {
            await this.email.send(
              notifyTo,
              `Batch ${batchId} concluído`,
              `Processamento concluído. Sucesso: ${completed}, Falhas: ${failed}, Total: ${total}.`
            );
            this.logger.info('batch notification sent', { batchId, notifyTo, total, completed, failed });
            // marcar no tracker para auditoria
            await client.hset(key, 'notified', '1', 'notifiedAt', new Date().toISOString());
          }
        }
      } catch (err2) {
        this.logger.warn('batch tracker finalize check failed', { error: (err2 as Error).message, batchId });
      }
    }
  }
}
