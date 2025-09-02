import { IsNumber, IsDateString, ValidateNested, Min, IsOptional } from "class-validator";
import { AssignorDto } from "../../assignors/dto/assignor.dto";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from '@nestjs/swagger';

// DTO personalizado para atualização de pagáveis
export class UpdatePayableRequestDto {
  @ApiPropertyOptional({
    description: 'Valor do pagável em reais',
    example: 1500.75,
    minimum: 0.01
  })
  @IsOptional()
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  value?: number;

  @ApiPropertyOptional({
    description: 'Data de emissão do pagável',
    example: '2024-12-31T00:00:00.000Z',
    format: 'date-time'
  })
  @IsOptional()
  @IsDateString({}, { message: 'A data de emissão deve ser uma data válida' })
  emissionDate?: string;

  @ApiPropertyOptional({
    description: 'Dados do cedente responsável pelo pagável',
    type: AssignorDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AssignorDto)
  assignor?: AssignorDto;
}
