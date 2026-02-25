import { IsInt, IsDate, IsEnum, IsDefined, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
	@IsDefined()
	@IsInt()
	student_id: number;

	@IsDefined()
	@IsDate()
	@Type(() => Date)
	date: Date;

	@IsDefined()
	@IsEnum(AttendanceStatus)
	status: AttendanceStatus;

	@IsOptional()
	@IsInt()
	modifier_id?: number;
}
