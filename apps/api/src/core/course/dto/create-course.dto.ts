import {
	IsString,
	IsInt,
	IsDate,
	IsNotEmpty,
	IsDefined,
	IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsOptional()
	@IsNotEmpty()
	@IsString()
	description?: string;

	@IsDefined()
	@IsInt()
	grade: number;

	@IsDefined()
	@IsInt()
	school_id: number;

	@IsDefined()
	@IsDate()
	@Type(() => Date)
	start_time: Date;

	@IsDefined()
	@IsDate()
	@Type(() => Date)
	end_time: Date;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	day_of_week: string;

	@IsDefined()
	@IsInt()
	duration: number;

	@IsDefined()
	@IsInt()
	modifier_id: number;
}
