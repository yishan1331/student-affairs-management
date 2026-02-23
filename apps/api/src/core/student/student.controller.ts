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
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma } from '@prisma/client';

@Controller('v1/student')
export class StudentController {
	constructor(private readonly studentService: StudentService) {}

	@Post()
	create(@Body() createStudentDto: CreateStudentDto) {
		return this.studentService.create(createStudentDto);
	}

	@Get()
	findAll(@Query() query: Prisma.StudentFindManyArgs) {
		return this.studentService.findAll(query);
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
