import {
	IsInt,
	IsDate,
	IsEnum,
	IsDefined,
	IsArray,
	ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

class AttendanceRecordDto {
	@IsDefined()
	@IsInt()
	student_id: number;

	@IsDefined()
	@IsEnum(AttendanceStatus)
	status: AttendanceStatus;
}

export class CreateBatchAttendanceDto {
	@IsDefined()
	@IsInt()
	course_id: number;

	@IsDefined()
	@IsDate()
	@Type(() => Date)
	date: Date;

	@IsDefined()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AttendanceRecordDto)
	records: AttendanceRecordDto[];
}
