import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { AssignorDto } from './dto/assignor.dto';
import { UpdateAssignorDto } from './dto/update-assignor.dto';
import { AssignorRepository } from './repositories/assignor.repository';

@Injectable()
export class AssignorsService {
  constructor(private assignorRepository: AssignorRepository) {}

  async create(createAssignorDto: AssignorDto) {
    const existingAssignor = await this.assignorRepository.findById(createAssignorDto.id);
    if (existingAssignor) {
      throw new ConflictException('Cedente com este ID já existe');
    }

    return this.assignorRepository.create(createAssignorDto);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [assignors, total] = await Promise.all([
      this.assignorRepository.findAllPaginated(skip, limit),
      this.assignorRepository.count(),
    ]);

    return {
      data: assignors,
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
    const assignor = await this.assignorRepository.findById(id);
    if (!assignor) {
      throw new NotFoundException('Cedente não encontrado');
    }

    return assignor;
  }

  async update(id: string, updateAssignorDto: UpdateAssignorDto) {
    const existingAssignor = await this.assignorRepository.findById(id);
    if (!existingAssignor) {
      throw new NotFoundException('Cedente não encontrado');
    }

    return this.assignorRepository.update(id, updateAssignorDto);
  }

  async remove(id: string) {
    const existingAssignor = await this.assignorRepository.findById(id);
    if (!existingAssignor) {
      throw new NotFoundException('Cedente não encontrado');
    }

    await this.assignorRepository.delete(id);
  }
}
