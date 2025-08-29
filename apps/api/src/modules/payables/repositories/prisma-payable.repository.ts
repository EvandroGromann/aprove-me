import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { PayableRepository } from './payable.repository';
import { PayableEntity } from '../entities/payable.entity';

@Injectable()
export class PrismaPayableRepository implements PayableRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<PayableEntity | null> {
    return this.prisma.payable.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<PayableEntity[]> {
    return this.prisma.payable.findMany({
      include: {
        assignor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllPaginated(skip: number, limit: number): Promise<PayableEntity[]> {
    return this.prisma.payable.findMany({
      skip,
      take: limit,
      include: {
        assignor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async count(): Promise<number> {
    return this.prisma.payable.count();
  }

  async create(payable: Omit<PayableEntity, 'createdAt' | 'updatedAt' | 'assignor'>): Promise<PayableEntity> {
    return this.prisma.payable.create({
      data: payable,
    });
  }

  async findByIdWithAssignor(id: string): Promise<PayableEntity | null> {
    return this.prisma.payable.findUnique({
      where: { id },
      include: {
        assignor: true,
      },
    });
  }
}
