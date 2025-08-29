import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';
import { PayableRepository } from './repositories/payable.repository';
import { AssignorRepository } from '../assignors/repositories/assignor.repository';

@Injectable()
export class PayablesService {
  constructor(
    private assignorRepository: AssignorRepository,
    private payableRepository: PayableRepository,
  ) {}

  async create(createPayableDto: CreatePayableRequestDto) {
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

    return this.payableRepository.findByIdWithAssignor(payable.id);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [payables, total] = await Promise.all([
      this.payableRepository.findAllPaginated(skip, limit),
      this.payableRepository.count(),
    ]);

    return {
      data: payables,
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

  async findOne(id: string) {
    const payable = await this.payableRepository.findByIdWithAssignor(id);
    if (!payable) {
      throw new NotFoundException('Pagável não encontrado');
    }

    return payable;
  }
}
