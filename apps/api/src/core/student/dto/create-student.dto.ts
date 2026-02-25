import {
	IsString,
	IsInt,
	IsBoolean,
	IsNotEmpty,
	IsDefined,
	IsOptional,
} from 'class-validator';

export class CreateStudentDto {
	@IsDefined()
	@IsNotEmpty()
	@IsString()
	name: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	number: string;

	@IsDefined()
	@IsNotEmpty()
	@IsString()
	gender: string;

	@IsDefined()
	@IsInt()
	course_id: number;

	@IsOptional()
	@IsBoolean()
	is_active?: boolean;

	@IsDefined()
	@IsInt()
	modifier_id: number;
}
