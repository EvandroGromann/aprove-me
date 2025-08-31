import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEmail, IsNotEmpty, ValidateNested } from 'class-validator';
import { CreatePayableRequestDto } from './create-payable-request.dto';

export class BatchPayablesRequestDto {
  @ApiProperty({ type: [CreatePayableRequestDto], description: 'Lista de pagáveis a serem processados (máx. 10.000)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @ValidateNested({ each: true })
  @Type(() => CreatePayableRequestDto)
  items!: CreatePayableRequestDto[];

  @ApiProperty({ description: 'Email para notificação ao final do processamento do lote' })
  @IsNotEmpty()
  @IsEmail()
  notifyTo!: string;
}
