import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário',
    example: 'cm0c4zp7r0000h3w8n8g8z7zn',
  })
  id: string;

  @ApiProperty({
    description: 'Login do usuário',
    example: 'admin',
  })
  login: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-08-29T14:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2024-08-29T14:30:00.000Z',
  })
  updatedAt: Date;
}
