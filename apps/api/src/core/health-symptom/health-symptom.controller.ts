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
import { HealthSymptomService } from './health-symptom.service';
import { CreateHealthSymptomDto } from './dto/create-health-symptom.dto';
import { UpdateHealthSymptomDto } from './dto/update-health-symptom.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

const symptomTypeMap: Record<string, string> = {
	vomiting: '嘔吐',
	coughing: '咳嗽',
	diarrhea: '腹瀉',
	skin_issue: '皮膚異常',
	eye_issue: '眼睛異常',
	ear_issue: '耳朵異常',
	appetite_loss: '食慾不振',
	lethargy: '精神不佳',
	breathing_issue: '呼吸異常',
	limping: '跛行',
	scratching: '抓癢',
	sneezing: '打噴嚏',
	fever: '發燒',
	other: '其他',
};

const severityMap: Record<string, string> = {
	mild: '輕微',
	moderate: '中度',
	severe: '嚴重',
};

@ApiTags('健康管理-症狀')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/health-symptom')
export class HealthSymptomController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly healthSymptomService: HealthSymptomService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['body_part', 'description'],
			filterableFields: ['user_id', 'symptom_type', 'severity', 'is_recurring', 'pet_id'],
			rangeFilterableFields: ['date'],
			defaultSort: { date: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Req() req: Request, @Body() dto: CreateHealthSymptomDto) {
		const user = req.user as any;
		return this.healthSymptomService.create(user.id, dto);
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
			this.queryBuilder.build<Prisma.HealthSymptomFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.healthSymptomService.findAll(prismaQuery, user.id, isAdmin),
			this.healthSymptomService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('statistics')
	getStatistics(@Query() query: any, @Req() req: Request) {
		const user = req.user as any;
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		return this.healthSymptomService.getStatistics(user.id, user.role === 'admin', petId);
	}

	@Get('trend')
	getTrend(@Query() query: any, @Req() req: Request) {
		const user = req.user as any;
		const period = query.period || 'week';
		const date = query.date || new Date().toISOString();
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		return this.healthSymptomService.getTrend(user.id, user.role === 'admin', period, date, petId);
	}

	@Get('export')
	async exportData(@Query() query: any, @Req() req: Request, @Res() res: Response) {
		const user = req.user as any;
		const petId = query.pet_id === 'null' ? null : query.pet_id ? +query.pet_id : undefined;
		const records = await this.healthSymptomService.exportData(
			user.id,
			user.role === 'admin',
			petId,
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('症狀紀錄');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '使用者', key: 'username', width: 15 },
			{ header: '日期', key: 'date', width: 15 },
			{ header: '時間', key: 'time', width: 10 },
			{ header: '症狀類型', key: 'symptom_type', width: 15 },
			{ header: '嚴重程度', key: 'severity', width: 10 },
			{ header: '發生次數', key: 'frequency', width: 10 },
			{ header: '持續時間(分鐘)', key: 'duration_minutes', width: 15 },
			{ header: '身體部位', key: 'body_part', width: 15 },
			{ header: '反覆發生', key: 'is_recurring', width: 10 },
			{ header: '詳細描述', key: 'description', width: 30 },
			{ header: '備註', key: 'note', width: 25 },
		];

		records.forEach((record: any) => {
			worksheet.addRow({
				id: record.id,
				username: record.user?.username || '',
				date: new Date(record.date).toLocaleDateString(),
				time: record.time,
				symptom_type: symptomTypeMap[record.symptom_type] || record.symptom_type,
				severity: severityMap[record.severity] || record.severity,
				frequency: record.frequency,
				duration_minutes: record.duration_minutes ?? '',
				body_part: record.body_part || '',
				is_recurring: record.is_recurring ? '是' : '否',
				description: record.description || '',
				note: record.note || '',
			});
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename=health-symptom.xlsx',
		);

		await workbook.xlsx.write(res);
		res.end();
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthSymptomService.findOne(+id, user.id, user.role === 'admin');
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() dto: UpdateHealthSymptomDto,
	) {
		const user = req.user as any;
		return this.healthSymptomService.update(+id, dto, user.id, user.role === 'admin');
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.healthSymptomService.remove(+id, user.id, user.role === 'admin');
	}
}
