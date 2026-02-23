import {
	IsString,
	IsBoolean,
	IsPositive,
	IsNotEmpty,
	IsDefined,
	IsOptional,
} from 'class-validator';

export class CreateSchoolDto {
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	code: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	description?: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	address?: string;

	@IsOptional()
	@IsBoolean()
	is_active?: boolean;

	@IsDefined()
	@IsPositive()
	modifier_id: number;
}
