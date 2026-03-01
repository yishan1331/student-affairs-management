import { IsDate, IsNumber, IsString, IsDefined, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHealthWeightDto {
	@IsDefined()
	@IsDate()
	@Type(() => Date)
	date: Date;

	@IsDefined()
	@IsNumber()
	@Min(0.1)
	@Max(500)
	weight: number;

	@IsOptional()
	@IsNumber()
	@Min(1)
	@Max(300)
	height?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	bmi?: number;

	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsNumber()
	pet_id?: number;
}
