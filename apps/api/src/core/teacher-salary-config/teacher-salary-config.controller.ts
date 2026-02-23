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
import { TeacherSalaryConfigService } from './teacher-salary-config.service';
import { CreateTeacherSalaryConfigDto } from './dto/create-teacher-salary-config.dto';
import { UpdateTeacherSalaryConfigDto } from './dto/update-teacher-salary-config.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('教師薪資設定')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/teacher-salary-config')
export class TeacherSalaryConfigController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly service: TeacherSalaryConfigService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: [],
			filterableFields: ['course_id', 'salary_base_id'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() dto: CreateTeacherSalaryConfigDto) {
		return this.service.create(dto);
	}

	@Get()
	async findAll(@Query() query: any, @Res({ passthrough: true }) res: Response) {
		const prismaQuery = this.queryBuilder.build<Prisma.TeacherSalaryConfigFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.service.findAll(prismaQuery),
			this.service.count(where),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('statistics')
	getStatistics(@Query('school_id') schoolId?: string) {
		return this.service.getStatistics(schoolId ? +schoolId : undefined);
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.service.findOne(+id);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() dto: UpdateTeacherSalaryConfigDto) {
		return this.service.update(+id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.service.remove(+id);
	}
}
