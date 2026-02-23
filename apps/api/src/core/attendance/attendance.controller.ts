import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/attendance')
export class AttendanceController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly attendanceService: AttendanceService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: [],
			filterableFields: ['student_id', 'status'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() createAttendanceDto: CreateAttendanceDto) {
		return this.attendanceService.create(createAttendanceDto);
	}

	@Get()
	findAll(@Query() query: any) {
		const prismaQuery =
			this.queryBuilder.build<Prisma.AttendanceFindManyArgs>(query);
		return this.attendanceService.findAll(prismaQuery);
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
