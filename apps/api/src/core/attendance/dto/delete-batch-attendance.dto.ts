import { IsDefined, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class DeleteBatchAttendanceDto {
	@IsDefined()
	@IsArray()
	@ArrayNotEmpty()
	@IsInt({ each: true })
	ids: number[];
}
