import {
	Controller,
	Get,
	Post,
	Patch,
	Delete,
	Body,
	Param,
	Query,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
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
			filterableFields: ['course_id', 'salary_base_id', 'school_id'],
			rangeFilterableFields: ['date'],
			relationFilters: { school_id: 'course.school_id' },
			defaultSort: { date: 'asc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() dto: CreateCourseSessionDto, @Req() req: Request) {
		const user = req.user as any;
		return this.courseSessionService.create(dto, user.id);
	}

	@Get()
	async findAll(@Query() query: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		const prismaQuery = this.queryBuilder.build<Prisma.CourseSessionFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.courseSessionService.findAll(prismaQuery, user.id, isAdmin),
			this.courseSessionService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('salary-summary')
	getSalarySummary(
		@Query('start_date') startDate: string,
		@Query('end_date') endDate: string,
		@Query('school_id') schoolId: string | undefined,
		@Req() req: Request,
	) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.courseSessionService.getSalarySummary(
			startDate,
			endDate,
			schoolId ? +schoolId : undefined,
			user.id,
			isAdmin,
		);
	}

	@Post('batch-generate')
	batchGenerate(@Body() dto: BatchGenerateCourseSessionDto, @Req() req: Request) {
		const user = req.user as any;
		return this.courseSessionService.batchGenerate(dto, user.id);
	}

	@Post('recalculate-salaries')
	recalculateSalaries(
		@Body() body: { start_date?: string; end_date?: string },
	) {
		return this.courseSessionService.recalculateAllSalaries(
			body?.start_date,
			body?.end_date,
		);
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.courseSessionService.findOne(+id, user.id, isAdmin);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() dto: UpdateCourseSessionDto, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.courseSessionService.update(+id, dto, user.id, isAdmin);
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.courseSessionService.remove(+id, user.id, isAdmin);
	}
}
