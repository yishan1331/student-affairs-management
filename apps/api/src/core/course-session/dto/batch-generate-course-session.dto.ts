import { IsArray, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BatchGenerateCourseSessionDto {
	@ApiProperty()
	@IsArray()
	@IsNumber({}, { each: true })
	course_ids: number[];

	@ApiProperty()
	@IsNumber()
	year: number;

	@ApiProperty()
	@IsNumber()
	month: number; // 1-12

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	modifier_id?: number;
}
