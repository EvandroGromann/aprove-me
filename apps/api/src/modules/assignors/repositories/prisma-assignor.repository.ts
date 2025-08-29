import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { AssignorRepository } from './assignor.repository';
import { AssignorEntity } from '../entities/assignor.entity';

@Injectable()
export class PrismaAssignorRepository implements AssignorRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<AssignorEntity | null> {
    return this.prisma.assignor.findUnique({
      where: { 
        id,
        deletedAt: null
      },
    });
  }

  async findAll(): Promise<AssignorEntity[]> {
    return this.prisma.assignor.findMany({
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllPaginated(skip: number, limit: number): Promise<AssignorEntity[]> {
    return this.prisma.assignor.findMany({
      skip,
      take: limit,
      where: {
        deletedAt: null
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(): Promise<number> {
    return this.prisma.assignor.count({
      where: {
        deletedAt: null,
      },
    });
  }

  async create(assignor: Omit<AssignorEntity, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<AssignorEntity> {
    return this.prisma.assignor.create({
      data: assignor,
    });
  }

  async update(id: string, assignor: Partial<Omit<AssignorEntity, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<AssignorEntity> {
    return this.prisma.assignor.update({
      where: { id },
      data: assignor,
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.assignor.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string): Promise<AssignorEntity> {
    return this.prisma.assignor.update({
      where: { id },
      data: {
        deletedAt: null,
      },
    });
  }

  async upsert(assignor: Omit<AssignorEntity, 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<AssignorEntity> {
    return this.prisma.assignor.upsert({
      where: { id: assignor.id },
      update: {
        document: assignor.document,
        email: assignor.email,
        phone: assignor.phone,
        name: assignor.name,
        deletedAt: null,
      },
      create: assignor,
    });
  }
}
