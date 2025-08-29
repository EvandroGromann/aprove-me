import { PartialType, OmitType } from '@nestjs/mapped-types';
import { AssignorDto } from './assignor.dto';

export class UpdateAssignorDto extends PartialType(OmitType(AssignorDto, ['id'] as const)) {}
