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
import * as ExcelJS from 'exceljs';
import { HealthWeightService } from './health-weight.service';
import { CreateHealthWeightDto } from './dto/create-health-weight.dto';
import { UpdateHealthWeightDto } from './dto/update-health-weight.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('健康管理-體重')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/health-weight')
export class HealthWeightController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly healthWeightService: HealthWeightService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: [],
			filterableFields: ['user_id'],
			rangeFilterableFields: ['date'],
			defaultSort: { date: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Req() req: Request, @Body() dto: CreateHealthWeightDto) {
		const user = req.user as any;
		return this.healthWeightService.create(user.id, dto);
	}

	@Get()
	async findAll(
		@Query() query: any,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		const prismaQuery =
			this.queryBuilder.build<Prisma.HealthWeightFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.healthWeightService.findAll(prismaQuery, user.id, isAdmin),
			this.healthWeightService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('statistics')
	getStatistics(@Req() req: Request) {
		const user = req.user as any;
		return this.healthWeightService.getStatistics(user.id, user.role === 'admin');
	}

	@Get('trend')
	getTrend(@Query() query: any, @Req() req: Request) {
		const user = req.user as any;
		const period = query.period || 'week';
		const date = query.date || new Date().toISOString();
		return this.healthWeightService.getTrend(user.id, user.role === 'admin', period, date);
	}

	@Get('export')
	async exportData(@Req() req: Request, @Res() res: Response) {
		const user = req.user as any;
		const records = await this.healthWeightService.exportData(
			user.id,
			user.role === 'admin',
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('體重紀錄');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '使用者', key: 'username', width: 15 },
			{ header: '日期', key: 'date', width: 15 },
			{ header: '體重(kg)', key: 'weight', width: 12 },
			{ header: '身高(cm)', key: 'height', width: 12 },
			{ header: 'BMI', key: 'bmi', width: 10 },
			{ header: '備註', key: 'note', width: 25 },
		];

		records.forEach((record: any) => {
			worksheet.addRow({
				id: record.id,
				username: record.user?.username || '',
				date: new Date(record.date).toLocaleDateString(),
				weight: record.weight,
				height: record.height || '',
				bmi: record.bmi || '',
				note: record.note || '',
			});
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename=health-weight.xlsx',
		);

		await workbook.xlsx.write(res);
		res.end();
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthWeightService.findOne(+id, user.id, user.role === 'admin');
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() dto: UpdateHealthWeightDto,
	) {
		const user = req.user as any;
		return this.healthWeightService.update(+id, dto, user.id, user.role === 'admin');
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthWeightService.remove(+id, user.id, user.role === 'admin');
	}
}
