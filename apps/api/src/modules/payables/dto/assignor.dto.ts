import { IsEmail, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class AssignorDto {
  @IsUUID('4', { message: 'O ID do cedente deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do cedente é obrigatório' })
  id: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  document: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(140)
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(140)
  name: string;
}