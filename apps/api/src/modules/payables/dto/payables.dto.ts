import { IsUUID, IsNotEmpty, IsNumber, IsDateString, Min } from 'class-validator';

export class PayableDto {
  @IsUUID('4', { message: 'O ID deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID é obrigatório' })
  id: string;

  @IsNumber({}, { message: 'O valor deve ser um número' })
  @IsNotEmpty({ message: 'O valor é obrigatório' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  value: number;

  @IsDateString({}, { message: 'A data de emissão deve ser uma data válida' })
  @IsNotEmpty({ message: 'A data de emissão é obrigatória' })
  emissionDate: string;

  @IsUUID('4', { message: 'O ID do cedente deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do cedente é obrigatório' })
  assignor: string;
}

