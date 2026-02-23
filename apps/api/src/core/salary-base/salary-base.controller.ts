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
import { SalaryBaseService } from './salary-base.service';
import { CreateSalaryBaseDto } from './dto/create-salary-base.dto';
import { UpdateSalaryBaseDto } from './dto/update-salary-base.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('薪資基底')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/salary-base')
export class SalaryBaseController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly salaryBaseService: SalaryBaseService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['name'],
			filterableFields: ['school_id', 'is_active'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Body() dto: CreateSalaryBaseDto) {
		return this.salaryBaseService.create(dto);
	}

	@Get()
	async findAll(@Query() query: any, @Res({ passthrough: true }) res: Response) {
		const prismaQuery = this.queryBuilder.build<Prisma.SalaryBaseFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.salaryBaseService.findAll(prismaQuery),
			this.salaryBaseService.count(where),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.salaryBaseService.findOne(+id);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() dto: UpdateSalaryBaseDto) {
		return this.salaryBaseService.update(+id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.salaryBaseService.remove(+id);
	}
}
