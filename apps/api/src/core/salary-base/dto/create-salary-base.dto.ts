import { IsString, IsNumber, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSalaryBaseDto {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty({ type: [Number], description: '關聯學校 ID 陣列' })
	@IsArray()
	@IsNumber({}, { each: true })
	@Type(() => Number)
	school_ids: number[];

	@ApiProperty()
	@IsNumber()
	hourly_rate: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	min_students?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	max_students?: number;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	description?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsBoolean()
	is_active?: boolean;

	@ApiPropertyOptional()
	@IsOptional()
	@IsNumber()
	modifier_id?: number;
}
