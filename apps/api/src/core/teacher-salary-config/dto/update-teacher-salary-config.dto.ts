import { PartialType } from '@nestjs/swagger';
import { CreateTeacherSalaryConfigDto } from './create-teacher-salary-config.dto';

export class UpdateTeacherSalaryConfigDto extends PartialType(CreateTeacherSalaryConfigDto) {}
