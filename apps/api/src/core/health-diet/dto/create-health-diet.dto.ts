import { IsDate, IsEnum, IsNumber, IsString, IsDefined, IsOptional } from 'class-validator';
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
	food_name: string;

	@IsOptional()
	@IsString()
	amount?: string;

	@IsOptional()
	@IsNumber()
	calories?: number;

	@IsOptional()
	@IsString()
	note?: string;
}
