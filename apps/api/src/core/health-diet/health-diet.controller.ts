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
import { HealthDietService } from './health-diet.service';
import { CreateHealthDietDto } from './dto/create-health-diet.dto';
import { UpdateHealthDietDto } from './dto/update-health-diet.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

const mealTypeMap: Record<string, string> = {
	breakfast: '早餐',
	lunch: '午餐',
	dinner: '晚餐',
	snack: '點心',
};

@ApiTags('健康管理-飲食')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/health-diet')
export class HealthDietController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly healthDietService: HealthDietService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['food_name'],
			filterableFields: ['user_id', 'meal_type', 'pet_id'],
			rangeFilterableFields: ['date'],
			defaultSort: { date: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Req() req: Request, @Body() dto: CreateHealthDietDto) {
		const user = req.user as any;
		return this.healthDietService.create(user.id, dto);
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
			this.queryBuilder.build<Prisma.HealthDietFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.healthDietService.findAll(prismaQuery, user.id, isAdmin),
			this.healthDietService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('statistics')
	getStatistics(@Query() query: any, @Req() req: Request) {
		const user = req.user as any;
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		return this.healthDietService.getStatistics(user.id, user.role === 'admin', petId);
	}

	@Get('export')
	async exportData(@Query() query: any, @Req() req: Request, @Res() res: Response) {
		const user = req.user as any;
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		const records = await this.healthDietService.exportData(
			user.id,
			user.role === 'admin',
			petId,
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('飲食紀錄');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '使用者', key: 'username', width: 15 },
			{ header: '日期', key: 'date', width: 15 },
			{ header: '餐別', key: 'meal_type', width: 10 },
			{ header: '食物名稱', key: 'food_name', width: 20 },
			{ header: '份量', key: 'amount', width: 15 },
			{ header: '卡路里', key: 'calories', width: 10 },
			{ header: '備註', key: 'note', width: 25 },
		];

		records.forEach((record: any) => {
			worksheet.addRow({
				id: record.id,
				username: record.user?.username || '',
				date: new Date(record.date).toLocaleDateString(),
				meal_type: mealTypeMap[record.meal_type] || record.meal_type,
				food_name: record.food_name,
				amount: record.amount || '',
				calories: record.calories || '',
				note: record.note || '',
			});
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename=health-diet.xlsx',
		);

		await workbook.xlsx.write(res);
		res.end();
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthDietService.findOne(+id, user.id, user.role === 'admin');
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() dto: UpdateHealthDietDto,
	) {
		const user = req.user as any;
		return this.healthDietService.update(+id, dto, user.id, user.role === 'admin');
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthDietService.remove(+id, user.id, user.role === 'admin');
	}
}
