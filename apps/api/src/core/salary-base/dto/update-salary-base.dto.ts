import { PartialType } from '@nestjs/swagger';
import { CreateSalaryBaseDto } from './create-salary-base.dto';

export class UpdateSalaryBaseDto extends PartialType(CreateSalaryBaseDto) {}
