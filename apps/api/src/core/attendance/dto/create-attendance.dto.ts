import { IsInt, IsDate, IsEnum, IsDefined } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';

export class CreateAttendanceDto {
	@IsDefined()
	@IsInt()
	student_id: number;

	@IsDefined()
	@IsDate()
	date: Date;

	@IsDefined()
	@IsEnum(AttendanceStatus)
	status: AttendanceStatus;
}
