import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSalaryBaseDto {
	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsNumber()
	school_id: number;

	@ApiProperty()
	@IsNumber()
	hourly_rate: number;

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
