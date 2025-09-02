import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';
import { PayableResponseDto } from './dto/payable-response.dto';
import { PayableRepository } from './repositories/payable.repository';
import { AssignorRepository } from '../assignors/repositories/assignor.repository';
import { PayableEntity } from './entities/payable.entity';
import { Log } from '../../shared/decorators/log.decorator';
import { v4 as uuidv4 } from 'uuid';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RequestContextService } from '../../shared/context/request-context.service';
import { UpdatePayableRequestDto } from './dto/update-payable-request.dto';

@Injectable()
export class PayablesService {
  constructor(
    private assignorRepository: AssignorRepository,
  private payableRepository: PayableRepository,
  @InjectQueue('payable-batch') private readonly queue: Queue,
  ) {}

  private mapToResponseDto(payable: PayableEntity): PayableResponseDto {
    return {
      id: payable.id,
      value: payable.value,
      emissionDate: payable.emissionDate,
      assignor: {
        id: payable.assignor.id,
        name: payable.assignor.name,
        document: payable.assignor.document,
        email: payable.assignor.email,
        phone: payable.assignor.phone,
      },
      createdAt: payable.createdAt,
      updatedAt: payable.updatedAt,
    };
  }

  @Log()
  async enqueueBatch(items: CreatePayableRequestDto[], notifyTo: string): Promise<{ batchId: string }>{
    const traceId = RequestContextService.getTraceId();
    const batchId = traceId || uuidv4();
    const jobs = items.map((item) => ({
      name: 'payable' as const,
      data: { batchId, item },
      opts: {
        jobId: `${batchId}:${item.id}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 4,
        backoff: {
          type: 'exponential',
          delay: 5_000,
        },
      },
    }));

    await (this.queue as any).addBulk(jobs);

    try {
      const client = await (this.queue as any).client;
      const key = `batch:payable:${batchId}`;
  await client.hset(
        key,
        'total', String(items.length),
        'completed', '0',
        'failed', '0',
        'notifyTo', notifyTo,
        'createdAt', new Date().toISOString(),
      );
      
      await client.expire(key, 60 * 60 * 24 * 7);
    } catch (err) {
      // não bloquear o fluxo se o tracker falhar; logs ocorrerão via interceptors
    }
    return { batchId };
  }

  @Log()
  async create(createPayableDto: CreatePayableRequestDto): Promise<PayableResponseDto> {
    const existingPayable = await this.payableRepository.findById(createPayableDto.id);
    if (existingPayable) {
      throw new ConflictException('Pagável com este ID já existe');
    }

    await this.assignorRepository.upsert({
      id: createPayableDto.assignor.id,
      document: createPayableDto.assignor.document,
      email: createPayableDto.assignor.email,
      phone: createPayableDto.assignor.phone,
      name: createPayableDto.assignor.name,
    });

    const payable = await this.payableRepository.create({
      id: createPayableDto.id,
      value: createPayableDto.value,
      emissionDate: new Date(createPayableDto.emissionDate),
      assignorId: createPayableDto.assignor.id,
    });

    return this.mapToResponseDto(payable);
  }

  @Log()
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [payables, total] = await Promise.all([
      this.payableRepository.findAllPaginated(skip, limit),
      this.payableRepository.count(),
    ]);

    return {
      data: payables.map(payable => this.mapToResponseDto(payable)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  @Log()
  async findOne(id: string): Promise<PayableResponseDto> {
    const payable = await this.payableRepository.findById(id);
    if (!payable) {
      throw new NotFoundException('Pagável não encontrado');
    }

    return this.mapToResponseDto(payable);
  }

  @Log()
  async update(id: string, updatePayableDto: UpdatePayableRequestDto): Promise<PayableResponseDto> {
    // Verificar se o pagável existe
    const existingPayable = await this.payableRepository.findById(id);
    if (!existingPayable) {
      throw new NotFoundException('Pagável não encontrado');
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (updatePayableDto.value !== undefined) {
      updateData.value = updatePayableDto.value;
    }

    if (updatePayableDto.emissionDate !== undefined) {
      updateData.emissionDate = new Date(updatePayableDto.emissionDate);
    }

    // Se houver atualização do cedente
    if (updatePayableDto.assignor !== undefined) {
      const assignorData = updatePayableDto.assignor;
      const assignorId = assignorData.id;
      
      // Upsert do cedente para garantir que existe
      await this.assignorRepository.upsert({
        id: assignorData.id,
        document: assignorData.document,
        email: assignorData.email,
        phone: assignorData.phone,
        name: assignorData.name,
      });
      
      updateData.assignorId = assignorId;
    }

    // Atualizar o pagável
    const updatedPayable = await this.payableRepository.update(id, updateData);
    return this.mapToResponseDto(updatedPayable);
  }
  
  @Log()
  async remove(id: string): Promise<void> {
    // Verificar se o pagável existe
    const existingPayable = await this.payableRepository.findById(id);
    if (!existingPayable) {
      throw new NotFoundException('Pagável não encontrado');
    }

    // Excluir o pagável
    await this.payableRepository.delete(id);
  }
}
