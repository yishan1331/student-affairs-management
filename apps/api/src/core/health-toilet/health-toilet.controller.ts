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
import { HealthToiletService } from './health-toilet.service';
import { CreateHealthToiletDto } from './dto/create-health-toilet.dto';
import { UpdateHealthToiletDto } from './dto/update-health-toilet.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

const toiletTypeMap: Record<string, string> = {
	urination: '小便',
	defecation: '大便',
};

@ApiTags('健康管理-如廁')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/health-toilet')
export class HealthToiletController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly healthToiletService: HealthToiletService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: [],
			filterableFields: ['user_id', 'type', 'is_normal', 'pet_id'],
			rangeFilterableFields: ['date'],
			defaultSort: { date: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Req() req: Request, @Body() dto: CreateHealthToiletDto) {
		const user = req.user as any;
		return this.healthToiletService.create(user.id, dto);
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
			this.queryBuilder.build<Prisma.HealthToiletFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.healthToiletService.findAll(prismaQuery, user.id, isAdmin),
			this.healthToiletService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('statistics')
	getStatistics(@Query() query: any, @Req() req: Request) {
		const user = req.user as any;
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		return this.healthToiletService.getStatistics(user.id, user.role === 'admin', petId);
	}

	@Get('trend')
	getTrend(@Query() query: any, @Req() req: Request) {
		const user = req.user as any;
		const period = query.period || 'week';
		const date = query.date || new Date().toISOString();
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		return this.healthToiletService.getTrend(user.id, user.role === 'admin', period, date, petId);
	}

	@Get('export')
	async exportData(@Query() query: any, @Req() req: Request, @Res() res: Response) {
		const user = req.user as any;
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		const records = await this.healthToiletService.exportData(
			user.id,
			user.role === 'admin',
			petId,
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('如廁紀錄');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '使用者', key: 'username', width: 15 },
			{ header: '日期', key: 'date', width: 15 },
			{ header: '時間', key: 'time', width: 10 },
			{ header: '類型', key: 'type', width: 10 },
			{ header: '是否正常', key: 'is_normal', width: 10 },
			{ header: '備註', key: 'note', width: 25 },
		];

		records.forEach((record: any) => {
			worksheet.addRow({
				id: record.id,
				username: record.user?.username || '',
				date: new Date(record.date).toLocaleDateString(),
				time: record.time,
				type: toiletTypeMap[record.type] || record.type,
				is_normal: record.is_normal ? '正常' : '異常',
				note: record.note || '',
			});
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename=health-toilet.xlsx',
		);

		await workbook.xlsx.write(res);
		res.end();
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthToiletService.findOne(+id, user.id, user.role === 'admin');
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() dto: UpdateHealthToiletDto,
	) {
		const user = req.user as any;
		return this.healthToiletService.update(+id, dto, user.id, user.role === 'admin');
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthToiletService.remove(+id, user.id, user.role === 'admin');
	}
}
