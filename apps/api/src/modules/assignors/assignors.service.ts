import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignorDto } from './dto/create-assignor.dto';
import { UpdateAssignorDto } from './dto/update-assignor.dto';
import { AssignorResponseDto } from './dto/assignor-response.dto';
import { AssignorRepository } from './repositories/assignor.repository';
import { AssignorEntity } from './entities/assignor.entity';
import { CustomLogger } from '../../shared/logger/custom-logger.service';
import { Log } from '../../shared/decorators/log.decorator';

@Injectable()
export class AssignorsService {
  constructor(
    private assignorRepository: AssignorRepository
  ) {}

  private mapToResponseDto(assignor: AssignorEntity): AssignorResponseDto {
    const { deletedAt, ...assignorResponse } = assignor;
    return assignorResponse;
  }

  @Log()
  async create(createAssignorDto: CreateAssignorDto): Promise<AssignorResponseDto> {
    const existingAssignor = await this.assignorRepository.findById(createAssignorDto.id);
    if (existingAssignor) {
      throw new ConflictException('Cedente com este ID já existe');
    }

    const createdAssignor = await this.assignorRepository.create(createAssignorDto);
    return this.mapToResponseDto(createdAssignor);
  }

  @Log()
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [assignors, total] = await Promise.all([
      this.assignorRepository.findAllPaginated(skip, limit),
      this.assignorRepository.count(),
    ]);

    return {
      data: assignors.map(assignor => this.mapToResponseDto(assignor)),
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
  async findOne(id: string): Promise<AssignorResponseDto> {
    const assignor = await this.assignorRepository.findById(id);
    if (!assignor) {
      throw new NotFoundException('Cedente não encontrado');
    }

    return this.mapToResponseDto(assignor);
  }

  @Log()
  async update(id: string, updateAssignorDto: UpdateAssignorDto): Promise<AssignorResponseDto> {
    const existingAssignor = await this.assignorRepository.findById(id);
    if (!existingAssignor) {
      throw new NotFoundException('Cedente não encontrado');
    }

    const updatedAssignor = await this.assignorRepository.update(id, updateAssignorDto);
    return this.mapToResponseDto(updatedAssignor);
  }

  @Log()
  async remove(id: string) {
    const existingAssignor = await this.assignorRepository.findById(id);
    if (!existingAssignor) {
      throw new NotFoundException('Cedente não encontrado');
    }

    await this.assignorRepository.softDelete(id);
  }

  @Log()
  async restore(id: string): Promise<AssignorResponseDto> {
    const restoredAssignor = await this.assignorRepository.restore(id);
    return this.mapToResponseDto(restoredAssignor);
  }
}
