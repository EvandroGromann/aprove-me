import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Login do usuário',
    example: 'aprovame',
  })
  @IsString()
  @IsNotEmpty()
  login: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'aprovame',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
