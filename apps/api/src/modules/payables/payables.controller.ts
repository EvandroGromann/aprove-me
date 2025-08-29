import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { PayablesService } from './payables.service';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';

@Controller('integrations')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Post('payable')
  async create(@Body() createPayableDto: CreatePayableRequestDto) {
    return this.payablesService.create(createPayableDto);
  }

  @Get('payable')
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.payablesService.findAll(pageNum, limitNum);
  }

  @Get('payable/:id')
  async findOne(@Param('id') id: string) {
    return this.payablesService.findOne(id);
  }
}
