import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';
import { PayableResponseDto } from './dto/payable-response.dto';
import { PayableRepository } from './repositories/payable.repository';
import { AssignorRepository } from '../assignors/repositories/assignor.repository';
import { PayableEntity } from './entities/payable.entity';
import { CustomLogger } from '../../shared/logger/custom-logger.service';
import { Log } from '../../shared/decorators/log.decorator';

@Injectable()
export class PayablesService {
  constructor(
    private assignorRepository: AssignorRepository,
    private payableRepository: PayableRepository
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
}
