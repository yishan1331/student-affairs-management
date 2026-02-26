import { IsArray, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchGenerateCourseSessionDto {
	@ApiProperty()
	@IsArray()
	@IsNumber({}, { each: true })
	course_ids: number[];

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	year?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	month?: number; // 1-12

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	start_date?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsDateString()
	end_date?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	modifier_id?: number;
}
