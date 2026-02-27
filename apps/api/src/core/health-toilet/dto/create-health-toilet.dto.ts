import {
	IsDate,
	IsEnum,
	IsBoolean,
	IsString,
	IsDefined,
	IsOptional,
	Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToiletType } from '@prisma/client';

export class CreateHealthToiletDto {
	@IsDefined()
	@IsDate()
	@Type(() => Date)
	date: Date;

	@IsDefined()
	@IsString()
	@Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
		message: 'time 格式必須為 HH:mm（例如 10:30）',
	})
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
