import { Controller, Post, Body } from '@nestjs/common';
import { PayablesService } from './payables.service';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';

@Controller('integrations')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Post('payable')
  async create(@Body() createPayableDto: CreatePayableRequestDto) {
    return this.payablesService.create(createPayableDto);
  }
}
