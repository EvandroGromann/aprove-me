import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AssignorRepository } from './assignor.repository';
import { AssignorEntity } from '../entities/assignor.entity';

@Injectable()
export class PrismaAssignorRepository implements AssignorRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<AssignorEntity | null> {
    return this.prisma.assignor.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<AssignorEntity[]> {
    return this.prisma.assignor.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllPaginated(skip: number, limit: number): Promise<AssignorEntity[]> {
    return this.prisma.assignor.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(): Promise<number> {
    return this.prisma.assignor.count();
  }

  async create(assignor: Omit<AssignorEntity, 'createdAt' | 'updatedAt'>): Promise<AssignorEntity> {
    return this.prisma.assignor.create({
      data: assignor,
    });
  }

  async update(id: string, assignor: Partial<Omit<AssignorEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AssignorEntity> {
    return this.prisma.assignor.update({
      where: { id },
      data: assignor,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assignor.delete({
      where: { id },
    });
  }

  async upsert(assignor: Omit<AssignorEntity, 'createdAt' | 'updatedAt'>): Promise<AssignorEntity> {
    return this.prisma.assignor.upsert({
      where: { id: assignor.id },
      update: {
        document: assignor.document,
        email: assignor.email,
        phone: assignor.phone,
        name: assignor.name,
      },
      create: assignor,
    });
  }
}
