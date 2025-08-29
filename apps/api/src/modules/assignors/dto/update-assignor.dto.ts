import { PartialType } from '@nestjs/mapped-types';
import { AssignorDto } from './assignor.dto';

export class UpdateAssignorDto extends PartialType(AssignorDto) {}
