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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('課程管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/course')
export class CourseController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly courseService: CourseService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['name'],
			filterableFields: ['grade', 'school_id'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() createCourseDto: CreateCourseDto) {
		return this.courseService.create(createCourseDto);
	}

	@Get()
	findAll(@Query() query: any) {
		const prismaQuery =
			this.queryBuilder.build<Prisma.CourseFindManyArgs>(query);
		return this.courseService.findAll(prismaQuery);
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
