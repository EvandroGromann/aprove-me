import { AssignorEntity } from '../../assignors/entities/assignor.entity';

export interface PayableEntity {
  id: string;
  value: number;
  emissionDate: Date;
  assignorId: string;
  createdAt: Date;
  updatedAt: Date;
  assignor?: AssignorEntity;
}
