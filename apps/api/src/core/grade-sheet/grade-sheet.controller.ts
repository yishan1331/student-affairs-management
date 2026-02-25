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
import { GradeSheetService } from './grade-sheet.service';
import { CreateGradeSheetDto } from './dto/create-grade-sheet.dto';
import { UpdateGradeSheetDto } from './dto/update-grade-sheet.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('成績管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/grade-sheet')
export class GradeSheetController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly gradeSheetService: GradeSheetService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: [],
			filterableFields: ['student_id'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() createGradeSheetDto: CreateGradeSheetDto) {
		return this.gradeSheetService.create(createGradeSheetDto);
	}

	@Get()
	async findAll(@Query() query: any, @Res({ passthrough: true }) res: Response) {
		const prismaQuery =
			this.queryBuilder.build<Prisma.GradeSheetFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.gradeSheetService.findAll(prismaQuery),
			this.gradeSheetService.count(where),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('statistics')
	getStatistics(@Query('course_id') courseId?: string) {
		return this.gradeSheetService.getStatistics(courseId ? +courseId : undefined);
	}

	@Get('export')
	async exportGradeSheets(@Query('course_id') courseId: string, @Res() res: Response) {
		const grades = await this.gradeSheetService.exportGradeSheets(
			courseId ? +courseId : undefined,
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('成績紀錄');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '學生姓名', key: 'student_name', width: 15 },
			{ header: '分數', key: 'score', width: 10 },
			{ header: '說明', key: 'description', width: 25 },
			{ header: '考試日期', key: 'exam_date', width: 15 },
		];

		grades.forEach((grade: any) => {
			worksheet.addRow({
				id: grade.id,
				student_name: grade.student?.name || '',
				score: grade.score,
				description: grade.description || '',
				exam_date: new Date(grade.exam_date).toLocaleDateString(),
			});
		});

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=grade-sheets.xlsx');

		await workbook.xlsx.write(res);
		res.end();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.gradeSheetService.findOne(+id);
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Body() updateGradeSheetDto: UpdateGradeSheetDto,
	) {
		return this.gradeSheetService.update(+id, updateGradeSheetDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.gradeSheetService.remove(+id);
	}
}
