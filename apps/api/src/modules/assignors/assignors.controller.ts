import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { AssignorsService } from './assignors.service';
import { CreateAssignorDto } from './dto/create-assignor.dto';
import { UpdateAssignorDto } from './dto/update-assignor.dto';
import { AssignorResponseDto } from './dto/assignor-response.dto';
import { JwtAuthGuard } from '../../shared/auth/guards/jwt-auth.guard';

@ApiTags('assignors')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AssignorsController {
  constructor(
    private readonly assignorsService: AssignorsService,
  ) {}

  @Post('assignor')
  @ApiOperation({ summary: 'Criar um novo cedente' })
  @ApiResponse({ 
    status: 201, 
    description: 'Cedente criado com sucesso',
    type: AssignorResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Cedente já existe' })
  async create(@Body() createAssignorDto: CreateAssignorDto): Promise<AssignorResponseDto> {
    return this.assignorsService.create(createAssignorDto);
  }

  @Get('assignor')
  @ApiOperation({ summary: 'Listar cedentes com paginação' })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página (padrão: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página (padrão: 10)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de cedentes com paginação',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AssignorResponseDto' }
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
    
    return this.assignorsService.findAll(pageNum, limitNum);
  }

  @Get('assignor/:id')
  @ApiOperation({ summary: 'Buscar cedente por ID' })
  @ApiParam({ name: 'id', description: 'UUID do cedente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cedente encontrado',
    type: AssignorResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Cedente não encontrado' })
  async findOne(@Param('id') id: string): Promise<AssignorResponseDto> {
    return this.assignorsService.findOne(id);
  }

  @Patch('assignor/:id')
  @ApiOperation({ summary: 'Atualizar dados do cedente' })
  @ApiParam({ name: 'id', description: 'UUID do cedente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cedente atualizado com sucesso',
    type: AssignorResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Cedente não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async update(
    @Param('id') id: string, 
    @Body() updateAssignorDto: UpdateAssignorDto
  ): Promise<AssignorResponseDto> {
    return this.assignorsService.update(id, updateAssignorDto);
  }

  @Delete('assignor/:id')
  @ApiOperation({ summary: 'Remover cedente (soft delete)' })
  @ApiParam({ name: 'id', description: 'UUID do cedente' })
  @ApiResponse({ status: 200, description: 'Cedente removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Cedente não encontrado' })
  async remove(@Param('id') id: string) {
    return this.assignorsService.remove(id);
  }

  @Post('assignor/:id/restore')
  @ApiOperation({ summary: 'Restaurar cedente removido' })
  @ApiParam({ name: 'id', description: 'UUID do cedente' })
  @ApiResponse({ 
    status: 200, 
    description: 'Cedente restaurado com sucesso',
    type: AssignorResponseDto 
  })
  @ApiResponse({ status: 404, description: 'Cedente não encontrado' })
  async restore(@Param('id') id: string): Promise<AssignorResponseDto> {
    return this.assignorsService.restore(id);
  }
}
