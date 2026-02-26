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
import { CourseSessionService } from './course-session.service';
import { CreateCourseSessionDto } from './dto/create-course-session.dto';
import { UpdateCourseSessionDto } from './dto/update-course-session.dto';
import { BatchGenerateCourseSessionDto } from './dto/batch-generate-course-session.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('課程節次')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/course-session')
export class CourseSessionController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly courseSessionService: CourseSessionService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: [],
			filterableFields: ['course_id', 'salary_base_id'],
			rangeFilterableFields: ['date'],
			relationFilters: { school_id: 'course.school_id' },
			defaultSort: { date: 'asc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() dto: CreateCourseSessionDto) {
		return this.courseSessionService.create(dto);
	}

	@Get()
	async findAll(@Query() query: any, @Res({ passthrough: true }) res: Response) {
		const prismaQuery = this.queryBuilder.build<Prisma.CourseSessionFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.courseSessionService.findAll(prismaQuery),
			this.courseSessionService.count(where),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('salary-summary')
	getSalarySummary(
		@Query('start_date') startDate: string,
		@Query('end_date') endDate: string,
		@Query('school_id') schoolId?: string,
	) {
		return this.courseSessionService.getSalarySummary(
			startDate,
			endDate,
			schoolId ? +schoolId : undefined,
		);
	}

	@Post('batch-generate')
	batchGenerate(@Body() dto: BatchGenerateCourseSessionDto) {
		return this.courseSessionService.batchGenerate(dto);
	}

	@Post('recalculate-salaries')
	recalculateSalaries() {
		return this.courseSessionService.recalculateAllSalaries();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.courseSessionService.findOne(+id);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() dto: UpdateCourseSessionDto) {
		return this.courseSessionService.update(+id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.courseSessionService.remove(+id);
	}
}
