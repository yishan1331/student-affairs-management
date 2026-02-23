import { PartialType } from '@nestjs/mapped-types';
import { CreateGradeSheetDto } from './create-grade-sheet.dto';

export class UpdateGradeSheetDto extends PartialType(CreateGradeSheetDto) {}
