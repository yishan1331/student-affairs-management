import { IsDate, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class IngestWeightDto {
	@IsDate()
	@Type(() => Date)
	date: Date;

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
}
