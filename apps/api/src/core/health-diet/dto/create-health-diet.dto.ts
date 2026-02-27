import {
	IsDate,
	IsEnum,
	IsNumber,
	IsString,
	IsDefined,
	IsOptional,
	MaxLength,
	Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from '@prisma/client';

export class CreateHealthDietDto {
	@IsDefined()
	@IsDate()
	@Type(() => Date)
	date: Date;

	@IsDefined()
	@IsEnum(MealType)
	meal_type: MealType;

	@IsDefined()
	@IsString()
	@MaxLength(200)
	food_name: string;

	@IsOptional()
	@IsString()
	@MaxLength(200)
	amount?: string;

	@IsOptional()
	@IsNumber()
	@Min(0)
	calories?: number;

	@IsOptional()
	@IsString()
	note?: string;
}
