import {
	Controller,
	Get,
	Post,
	Put,
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
	create(@Body() createCourseDto: CreateCourseDto, @Req() req: Request) {
		const user = req.user as any;
		return this.courseService.create(createCourseDto, user.id);
	}

	@Get('schedule')
	async findSchedule(@Query() query: any, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		const filters = {
			school_id: query.school_id ? Number(query.school_id) : undefined,
			grade: query.grade !== undefined ? Number(query.grade) : undefined,
			name: query.name || undefined,
			day_of_week: query.day_of_week || undefined,
		};
		return this.courseService.findSchedule(filters, user.id, isAdmin);
	}

	@Get()
	async findAll(@Query() query: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		const prismaQuery =
			this.queryBuilder.build<Prisma.CourseFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.courseService.findAll(prismaQuery, user.id, isAdmin),
			this.courseService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.courseService.findOne(+id, user.id, isAdmin);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.courseService.update(+id, updateCourseDto, user.id, isAdmin);
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.courseService.remove(+id, user.id, isAdmin);
	}
}
