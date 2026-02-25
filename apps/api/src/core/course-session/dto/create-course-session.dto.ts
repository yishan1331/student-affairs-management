import {
	IsNumber,
	IsOptional,
	IsString,
	IsDateString,
	IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseSessionDto {
	@ApiProperty()
	@IsNumber()
	course_id: number;

	@ApiProperty()
	@IsDateString()
	date: string;

	@ApiProperty()
	@IsNumber()
	actual_student_count: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	is_cancelled?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	note?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	modifier_id?: number;
}
