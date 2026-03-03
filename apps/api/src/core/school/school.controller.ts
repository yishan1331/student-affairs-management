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
	async findAll(@Query() query: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		const prismaQuery =
			this.queryBuilder.build<Prisma.SchoolFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.schoolService.findAll(prismaQuery, user.id, isAdmin),
			this.schoolService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.schoolService.findOne(+id, user.id, isAdmin);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() updateSchoolDto: UpdateSchoolDto, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.schoolService.update(+id, updateSchoolDto, user.id, isAdmin);
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.schoolService.remove(+id, user.id, isAdmin);
	}
}
