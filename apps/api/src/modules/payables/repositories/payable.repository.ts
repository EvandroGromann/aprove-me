import { PayableEntity } from '../entities/payable.entity';

export abstract class PayableRepository {
  abstract findById(id: string): Promise<PayableEntity | null>;
  abstract findAll(): Promise<PayableEntity[]>;
  abstract findAllPaginated(skip: number, limit: number): Promise<PayableEntity[]>;
  abstract count(): Promise<number>;
  abstract create(payable: Omit<PayableEntity, 'createdAt' | 'updatedAt' | 'assignor'>): Promise<PayableEntity>;
  abstract update(id: string, data: Partial<Omit<PayableEntity, 'id' | 'createdAt' | 'updatedAt' | 'assignor'>>): Promise<PayableEntity>;
  abstract delete(id: string): Promise<PayableEntity>;
}
