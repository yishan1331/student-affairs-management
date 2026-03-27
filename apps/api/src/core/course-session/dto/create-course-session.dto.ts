import {
	IsNumber,
	IsOptional,
	IsString,
	IsDateString,
	IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseSessionDto {
	@ApiPropertyOptional({ description: '正式課程 ID（代課時可不填）' })
	@IsOptional()
	@IsNumber()
	course_id?: number;

	@ApiPropertyOptional({ description: '代課時手動輸入的課程名稱' })
	@IsOptional()
	@IsString()
	course_name?: string;

	@ApiPropertyOptional({ description: '代課時指定的學校 ID（用於薪資計算）' })
	@IsOptional()
	@IsNumber()
	school_id?: number;

	@ApiPropertyOptional({ description: '代課時的上課時長（分鐘）' })
	@IsOptional()
	@IsNumber()
	duration?: number;

	@ApiProperty()
	@IsDateString()
	date: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	actual_student_count?: number;

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
