import { Injectable } from '@nestjs/common';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';

@Injectable()
export class PayablesService {
  async create(createPayableDto: CreatePayableRequestDto) {
    return {
      message: 'Pagável criado com sucesso',
      data: createPayableDto,
    };
  }
}
