import { AssignorSummaryDto } from '../../../shared/dto/assignor-summary.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PayableResponseDto {
  @ApiProperty({
    description: 'UUID único do pagável',
    example: '550e8400-e29b-41d4-a716-446655440001'
  })
  id: string;

  @ApiProperty({
    description: 'Valor do pagável em reais',
    example: 1500.75
  })
  value: number;

  @ApiProperty({
    description: 'Data de emissão do pagável',
    example: '2024-12-31T00:00:00.000Z'
  })
  emissionDate: Date;

  @ApiProperty({
    description: 'Dados resumidos do cedente',
    type: AssignorSummaryDto
  })
  assignor: AssignorSummaryDto;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-08-29T10:30:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2025-08-29T10:30:00.000Z'
  })
  updatedAt: Date;
}
