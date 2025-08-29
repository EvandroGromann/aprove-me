import { IsNotEmpty, IsNumber, IsDateString, IsUUID, ValidateNested, Min } from "class-validator";
import { AssignorDto } from "../../assignors/dto/assignor.dto";
import { Type } from "class-transformer";

export class CreatePayableRequestDto {
  @IsUUID('4', { message: 'O ID do pagável deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do pagável é obrigatório' })
  id: string;

  @IsNotEmpty()
  @IsNumber({}, { message: 'O valor deve ser um número' })
  @Min(0.01, { message: 'O valor deve ser maior que zero' })
  value: number;

  @IsNotEmpty()
  @IsDateString({}, { message: 'A data de emissão deve ser uma data válida' })
  emissionDate: string;

  @ValidateNested()
  @Type(() => AssignorDto)
  assignor: AssignorDto;
}
