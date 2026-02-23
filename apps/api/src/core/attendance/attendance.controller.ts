import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Prisma } from '@prisma/client';

@Controller('v1/attendance')
export class AttendanceController {
	constructor(private readonly attendanceService: AttendanceService) {}

	@Post()
	create(@Body() createAttendanceDto: CreateAttendanceDto) {
		return this.attendanceService.create(createAttendanceDto);
	}

	@Get()
	findAll(@Query() query: Prisma.AttendanceFindManyArgs) {
		return this.attendanceService.findAll(query);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.attendanceService.findOne(+id);
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Body() updateAttendanceDto: UpdateAttendanceDto,
	) {
		return this.attendanceService.update(+id, updateAttendanceDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.attendanceService.remove(+id);
	}
}
