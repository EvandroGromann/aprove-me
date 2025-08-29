import { IsUUID, IsNotEmpty, IsString, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignorDto {
  @ApiProperty({
    description: 'UUID único do cedente',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid'
  })
  @IsUUID('4', { message: 'O ID do cedente deve ser um UUID válido' })
  @IsNotEmpty({ message: 'O ID do cedente é obrigatório' })
  id: string;

  @ApiProperty({
    description: 'Documento do cedente (CPF ou CNPJ)',
    example: '12345678900',
    maxLength: 30
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  document: string;

  @ApiProperty({
    description: 'Email do cedente',
    example: 'joao@exemplo.com',
    format: 'email',
    maxLength: 140
  })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(140)
  email: string;

  @ApiProperty({
    description: 'Telefone do cedente',
    example: '11999888777',
    maxLength: 20
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    description: 'Nome completo do cedente',
    example: 'João Silva Santos',
    maxLength: 140
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(140)
  name: string;
}
