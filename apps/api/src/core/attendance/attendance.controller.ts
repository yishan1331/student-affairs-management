import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateBatchAttendanceDto } from './dto/create-batch-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('考勤管理')
@ApiBearerAuth()
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
	async findAll(@Query() query: any, @Res({ passthrough: true }) res: Response) {
		const prismaQuery =
			this.queryBuilder.build<Prisma.AttendanceFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.attendanceService.findAll(prismaQuery),
			this.attendanceService.count(where),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Post('batch')
	createBatch(@Body() createBatchAttendanceDto: CreateBatchAttendanceDto) {
		return this.attendanceService.createBatch(createBatchAttendanceDto);
	}

	@Get('statistics')
	getStatistics(@Query('course_id') courseId?: string) {
		return this.attendanceService.getStatistics(
			courseId ? +courseId : undefined,
		);
	}

	@Get('export')
	async exportAttendance(@Query('course_id') courseId: string, @Res() res: Response) {
		const attendances = await this.attendanceService.exportAttendance(
			courseId ? +courseId : undefined,
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('考勤紀錄');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '學生姓名', key: 'student_name', width: 15 },
			{ header: '日期', key: 'date', width: 15 },
			{ header: '狀態', key: 'status', width: 10 },
		];

		const statusMap: Record<string, string> = {
			attendance: '出席',
			absent: '缺席',
			late: '遲到',
			excused: '請假',
		};

		attendances.forEach((record: any) => {
			worksheet.addRow({
				id: record.id,
				student_name: record.student?.name || '',
				date: new Date(record.date).toLocaleDateString(),
				status: statusMap[record.status] || record.status,
			});
		});

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');

		await workbook.xlsx.write(res);
		res.end();
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
