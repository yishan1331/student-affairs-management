import { IsDate, IsNumber, IsString, IsDefined, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHealthWeightDto {
	@IsDefined()
	@IsDate()
	@Type(() => Date)
	date: Date;

	@IsDefined()
	@IsNumber()
	weight: number;

	@IsOptional()
	@IsNumber()
	height?: number;

	@IsOptional()
	@IsNumber()
	bmi?: number;

	@IsOptional()
	@IsString()
	note?: string;
}
