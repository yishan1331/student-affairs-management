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
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Prisma } from '@prisma/client';

@Controller('v1/course')
export class CourseController {
	constructor(private readonly courseService: CourseService) {}

	@Post()
	create(@Body() createCourseDto: CreateCourseDto) {
		return this.courseService.create(createCourseDto);
	}

	@Get()
	findAll(@Query() query: Prisma.CourseFindManyArgs) {
		return this.courseService.findAll(query);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.courseService.findOne(+id);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
		return this.courseService.update(+id, updateCourseDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.courseService.remove(+id);
	}
}
