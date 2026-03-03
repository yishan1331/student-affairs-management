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
import { SalaryBaseService } from './salary-base.service';
import { CreateSalaryBaseDto } from './dto/create-salary-base.dto';
import { UpdateSalaryBaseDto } from './dto/update-salary-base.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('薪資級距')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/salary-base')
export class SalaryBaseController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly salaryBaseService: SalaryBaseService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['name'],
			filterableFields: ['is_active'],
			relationFilters: { school_id: 'schools.some.id' },
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() dto: CreateSalaryBaseDto) {
		return this.salaryBaseService.create(dto);
	}

	@Get()
	async findAll(@Query() query: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		const prismaQuery = this.queryBuilder.build<Prisma.SalaryBaseFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.salaryBaseService.findAll(prismaQuery, user.id, isAdmin),
			this.salaryBaseService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.salaryBaseService.findOne(+id, user.id, isAdmin);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() dto: UpdateSalaryBaseDto, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.salaryBaseService.update(+id, dto, user.id, isAdmin);
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.salaryBaseService.remove(+id, user.id, isAdmin);
	}
}
