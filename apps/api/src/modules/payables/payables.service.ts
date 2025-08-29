import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';
import { PayableResponseDto } from './dto/payable-response.dto';
import { PayableRepository } from './repositories/payable.repository';
import { AssignorRepository } from '../assignors/repositories/assignor.repository';
import { PayableEntity } from './entities/payable.entity';
import { CustomLogger } from '../../shared/logger/custom-logger.service';

@Injectable()
export class PayablesService {
  constructor(
    private assignorRepository: AssignorRepository,
    private payableRepository: PayableRepository,
    private logger: CustomLogger,
  ) {
    this.logger.setContext('PayablesService');
  }

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

  async create(createPayableDto: CreatePayableRequestDto): Promise<PayableResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Creating payable with ID: ${createPayableDto.id}`);

    try {
      const existingPayable = await this.payableRepository.findById(createPayableDto.id);
      if (existingPayable) {
        this.logger.warn(`Payable creation failed - ID already exists: ${createPayableDto.id}`);
        throw new ConflictException('Pagável com este ID já existe');
      }

      this.logger.debug(`Upserting assignor: ${createPayableDto.assignor.id}`);
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

      const duration = Date.now() - startTime;
      this.logger.audit('Payable created', {
        payableId: payable.id,
        value: payable.value,
        assignorId: createPayableDto.assignor.id,
        assignorName: createPayableDto.assignor.name
      });

      this.logger.business('New payable registered', {
        payableId: payable.id,
        value: payable.value,
        assignorDocument: createPayableDto.assignor.document
      });

      this.logger.performance('Payable creation', duration, {
        payableId: payable.id,
        success: true
      });

      return this.mapToResponseDto(payable);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.performance('Payable creation', duration, {
        payableId: createPayableDto.id,
        success: false,
        error: error.message
      });
      throw error;
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    const startTime = Date.now();
    this.logger.debug(`Fetching payables - page: ${page}, limit: ${limit}`);

    const skip = (page - 1) * limit;
    const [payables, total] = await Promise.all([
      this.payableRepository.findAllPaginated(skip, limit),
      this.payableRepository.count(),
    ]);

    const duration = Date.now() - startTime;
    this.logger.performance('Payables list fetch', duration, {
      page,
      limit,
      totalRecords: total,
      returnedRecords: payables.length
    });

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

  async findOne(id: string): Promise<PayableResponseDto> {
    this.logger.debug(`Finding payable by ID: ${id}`);
    
    const payable = await this.payableRepository.findById(id);
    if (!payable) {
      this.logger.warn(`Payable not found: ${id}`);
      throw new NotFoundException('Pagável não encontrado');
    }

    this.logger.debug(`Payable found: ${id}`);
    return this.mapToResponseDto(payable);
  }
}
