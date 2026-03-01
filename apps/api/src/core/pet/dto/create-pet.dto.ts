import {
	IsString,
	IsEnum,
	IsNumber,
	IsBoolean,
	IsDate,
	IsDefined,
	IsOptional,
	MaxLength,
	Min,
	Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PetType } from '@prisma/client';

export class CreatePetDto {
	@IsDefined()
	@IsString()
	@MaxLength(100)
	name: string;

	@IsDefined()
	@IsEnum(PetType)
	type: PetType;

	@IsOptional()
	@IsString()
	@MaxLength(100)
	breed?: string;

	@IsOptional()
	@IsString()
	gender?: string;

	@IsOptional()
	@IsDate()
	@Type(() => Date)
	birthday?: Date;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(1000)
	weight?: number;

	@IsOptional()
	@IsString()
	avatar_url?: string;

	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsBoolean()
	is_active?: boolean;
}
