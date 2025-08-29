import { Controller, Post, Get, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PayablesService } from './payables.service';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';
import { PayableResponseDto } from './dto/payable-response.dto';

@ApiTags('payables')
@Controller('integrations')
export class PayablesController {
  constructor(private readonly payablesService: PayablesService) {}

  @Post('payable')
  @ApiOperation({ summary: 'Criar um novo pagável' })
  @ApiResponse({ 
    status: 201, 
    description: 'Pagável criado com sucesso',
    type: PayableResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Pagável já existe' })
  async create(@Body() createPayableDto: CreatePayableRequestDto): Promise<PayableResponseDto> {
    return this.payablesService.create(createPayableDto);
  }

  @Get('payable')
  @ApiOperation({ summary: 'Listar pagáveis com paginação' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página (padrão: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de pagáveis com paginação',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/PayableResponseDto' }
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number' },
            limit: { type: 'number' },
            total: { type: 'number' },
            totalPages: { type: 'number' },
            hasNext: { type: 'boolean' },
            hasPrev: { type: 'boolean' }
          }
        }
      }
    }
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.payablesService.findAll(pageNum, limitNum);
  }

  @Get('payable/:id')
  @ApiOperation({ summary: 'Buscar pagável por ID' })
  @ApiParam({ name: 'id', description: 'UUID do pagável' })
  @ApiResponse({ 
    status: 200, 
    description: 'Pagável encontrado',
    type: PayableResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Pagável não encontrado' })
  async findOne(@Param('id') id: string): Promise<PayableResponseDto> {
    return this.payablesService.findOne(id);
  }
}
