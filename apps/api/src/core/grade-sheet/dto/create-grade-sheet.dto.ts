import {
	IsInt,
	IsNumber,
	IsString,
	IsDate,
	IsNotEmpty,
	IsDefined,
	IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGradeSheetDto {
	@IsDefined()
	@IsInt()
	student_id: number;

	@IsDefined()
	@IsNumber()
	score: number;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	description?: string;

	@IsDefined()
	@IsDate()
	@Type(() => Date)
	exam_date: Date;

	@IsDefined()
	@IsInt()
	modifier_id: number;
}
