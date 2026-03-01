import {
	IsDate,
	IsEnum,
	IsBoolean,
	IsNumber,
	IsString,
	IsDefined,
	IsOptional,
	Matches,
	Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SymptomType, Severity } from '@prisma/client';

export class CreateHealthSymptomDto {
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
	@IsEnum(SymptomType)
	symptom_type: SymptomType;

	@IsDefined()
	@IsEnum(Severity)
	severity: Severity;

	@IsOptional()
	@IsNumber()
	@Min(1)
	frequency?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	duration_minutes?: number;

	@IsOptional()
	@IsString()
	body_part?: string;

	@IsOptional()
	@IsBoolean()
	is_recurring?: boolean;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	note?: string;

	@IsOptional()
	@IsNumber()
	pet_id?: number;
}
