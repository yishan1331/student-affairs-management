import { IsDate, IsEnum, IsBoolean, IsString, IsDefined, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ToiletType } from '@prisma/client';

export class CreateHealthToiletDto {
	@IsDefined()
	@IsDate()
	@Type(() => Date)
	date: Date;

	@IsDefined()
	@IsString()
	time: string;

	@IsDefined()
	@IsEnum(ToiletType)
	type: ToiletType;

	@IsOptional()
	@IsBoolean()
	is_normal?: boolean;

	@IsOptional()
	@IsString()
	note?: string;
}
