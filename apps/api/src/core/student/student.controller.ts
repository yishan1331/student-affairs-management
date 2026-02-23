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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

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
