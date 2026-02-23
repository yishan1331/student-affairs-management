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
import { SchoolService } from './school.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('學校管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/school')
export class SchoolController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly schoolService: SchoolService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['name', 'code'],
			filterableFields: ['is_active'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() createSchoolDto: CreateSchoolDto) {
		return this.schoolService.create(createSchoolDto);
	}

	@Get()
	async findAll(@Query() query: any, @Res({ passthrough: true }) res: Response) {
		const prismaQuery =
			this.queryBuilder.build<Prisma.SchoolFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.schoolService.findAll(prismaQuery),
			this.schoolService.count(where),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.schoolService.findOne(+id);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto) {
		return this.schoolService.update(+id, updateSchoolDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.schoolService.remove(+id);
	}
}
