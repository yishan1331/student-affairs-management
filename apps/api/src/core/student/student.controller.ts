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
	UseInterceptors,
	UploadedFile,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('學生管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/student')
export class StudentController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly studentService: StudentService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['name', 'number'],
			filterableFields: ['is_active', 'course_id', 'gender'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() createStudentDto: CreateStudentDto) {
		return this.studentService.create(createStudentDto);
	}

	@Get()
	findAll(@Query() query: any) {
		const prismaQuery =
			this.queryBuilder.build<Prisma.StudentFindManyArgs>(query);
		return this.studentService.findAll(prismaQuery);
	}

	@Get('export')
	async exportStudents(@Query('course_id') courseId: string, @Res() res: Response) {
		const students = await this.studentService.exportStudents(
			courseId ? +courseId : undefined,
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('學生名單');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '姓名', key: 'name', width: 15 },
			{ header: '學號', key: 'number', width: 15 },
			{ header: '性別', key: 'gender', width: 10 },
			{ header: '課程', key: 'course_name', width: 20 },
			{ header: '狀態', key: 'is_active', width: 10 },
		];

		students.forEach((student: any) => {
			worksheet.addRow({
				id: student.id,
				name: student.name,
				number: student.number,
				gender: student.gender,
				course_name: student.course?.name || '',
				is_active: student.is_active ? '活躍' : '停用',
			});
		});

		res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
		res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');

		await workbook.xlsx.write(res);
		res.end();
	}

	@Post('import')
	@UseInterceptors(FileInterceptor('file'))
	async importStudents(@UploadedFile() file: Express.Multer.File) {
		const ExcelJS = require('exceljs');
		const workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(file.buffer);

		const worksheet = workbook.getWorksheet(1);
		const students: any[] = [];

		worksheet.eachRow((row: any, rowNumber: number) => {
			if (rowNumber === 1) return; // skip header
			students.push({
				name: String(row.getCell(1).value || ''),
				number: String(row.getCell(2).value || ''),
				gender: String(row.getCell(3).value || ''),
				course_id: Number(row.getCell(4).value),
				modifier_id: Number(row.getCell(5).value) || 1,
			});
		});

		return this.studentService.importStudents(students);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.studentService.findOne(+id);
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Body() updateStudentDto: UpdateStudentDto,
	) {
		return this.studentService.update(+id, updateStudentDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.studentService.remove(+id);
	}
}
