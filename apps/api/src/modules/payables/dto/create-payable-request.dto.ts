import { IsNotEmpty, IsNumber, IsDateString, IsUUID, ValidateNested, Min } from "class-validator";
import { AssignorDto } from "../../assignors/dto/assignor.dto";
import { Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

export class CreatePayableRequestDto {
  @ApiProperty({
    description: 'UUID único do pagável',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'O ID do pagável deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do pagável é obrigatório' })
  id: string;

  @ApiProperty({
    description: 'Valor do pagável em reais',
    example: 1500.75,
    minimum: 0.01
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  value: number;

  @ApiProperty({
    description: 'Data de emissão do pagável',
    example: '2024-12-31T00:00:00.000Z',
    format: 'date-time'
  })
  @IsNotEmpty()
  @IsDateString({}, { message: 'A data de emissão deve ser uma data válida' })
  emissionDate: string;

  @ApiProperty({
    description: 'Dados do cedente responsável pelo pagável',
    type: AssignorDto
  })
  @ValidateNested()
  @Type(() => AssignorDto)
  assignor: AssignorDto;
}
