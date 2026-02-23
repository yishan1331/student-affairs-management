import { IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherSalaryConfigDto {
	@ApiProperty()
	@IsNumber()
	course_id: number;

	@ApiProperty()
	@IsNumber()
	salary_base_id: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	modifier_id?: number;
}
