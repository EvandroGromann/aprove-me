import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AssignorsService } from './assignors.service';
import { CreateAssignorDto } from './dto/create-assignor.dto';
import { UpdateAssignorDto } from './dto/update-assignor.dto';

@Controller('integrations')
export class AssignorsController {
  constructor(private readonly assignorsService: AssignorsService) {}

  @Post('assignor')
  create(@Body() createAssignorDto: CreateAssignorDto) {
    return this.assignorsService.create(createAssignorDto);
  }

  @Get('assignor')
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.assignorsService.findAll(pageNum, limitNum);
  }

  @Get('assignor/:id')
  findOne(@Param('id') id: string) {
    return this.assignorsService.findOne(id);
  }

  @Patch('assignor/:id')
  update(@Param('id') id: string, @Body() updateAssignorDto: UpdateAssignorDto) {
    return this.assignorsService.update(id, updateAssignorDto);
  }

  @Delete('assignor/:id')
  remove(@Param('id') id: string) {
    return this.assignorsService.remove(id);
  }

  @Post('assignor/:id/restore')
  restore(@Param('id') id: string) {
    return this.assignorsService.restore(id);
  }
}
