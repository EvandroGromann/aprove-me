import { AssignorSummaryDto } from '../../../shared/dto/assignor-summary.dto';

export class PayableResponseDto {
  id: string;
  value: number;
  emissionDate: Date;
  assignor: AssignorSummaryDto;
  createdAt: Date;
  updatedAt: Date;
}
