import { ApiProperty } from '@nestjs/swagger';

export class AssignorResponseDto {
  @ApiProperty({
    description: 'UUID único do cedente',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  id: string;

  @ApiProperty({
    description: 'Documento do cedente (CPF ou CNPJ)',
    example: '12345678900'
  })
  document: string;

  @ApiProperty({
    description: 'Email do cedente',
    example: 'joao@exemplo.com'
  })
  email: string;

  @ApiProperty({
    description: 'Telefone do cedente',
    example: '11999888777'
  })
  phone: string;

  @ApiProperty({
    description: 'Nome completo do cedente',
    example: 'João Silva Santos'
  })
  name: string;

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
