import { AssignorEntity } from '../entities/assignor.entity';

export abstract class AssignorRepository {
  abstract findById(id: string): Promise<AssignorEntity | null>;
  abstract findAll(): Promise<AssignorEntity[]>;
  abstract findAllPaginated(skip: number, limit: number): Promise<AssignorEntity[]>;
  abstract count(): Promise<number>;
  abstract create(assignor: Omit<AssignorEntity, 'createdAt' | 'updatedAt'>): Promise<AssignorEntity>;
  abstract update(id: string, assignor: Partial<Omit<AssignorEntity, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AssignorEntity>;
  abstract delete(id: string): Promise<void>;
  abstract upsert(assignor: Omit<AssignorEntity, 'createdAt' | 'updatedAt'>): Promise<AssignorEntity>;
}
