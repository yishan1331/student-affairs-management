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
import { PetService } from './pet.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

const petTypeMap: Record<string, string> = {
	dog: '狗',
	cat: '貓',
	bird: '鳥',
	fish: '魚',
	hamster: '倉鼠',
	rabbit: '兔',
	other: '其他',
};

const genderMap: Record<string, string> = {
	male: '公',
	female: '母',
	unknown: '未知',
};

@ApiTags('寵物管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/pet')
export class PetController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly petService: PetService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['name'],
			filterableFields: ['user_id', 'type', 'is_active'],
			defaultSort: { created_at: 'desc' },
			defaultPageSize: 10,
		});
	}

	@Post()
	create(@Req() req: Request, @Body() dto: CreatePetDto) {
		const user = req.user as any;
		return this.petService.create(user.id, dto);
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
			this.queryBuilder.build<Prisma.PetFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.petService.findAll(prismaQuery, user.id, isAdmin),
			this.petService.count(where, user.id, isAdmin),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get('my-pets')
	getMyPets(@Req() req: Request) {
		const user = req.user as any;
		return this.petService.findMyPets(user.id);
	}

	@Get('export')
	async exportData(@Req() req: Request, @Res() res: Response) {
		const user = req.user as any;
		const records = await this.petService.exportData(
			user.id,
			user.role === 'admin',
		);

		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('寵物資料');

		worksheet.columns = [
			{ header: 'ID', key: 'id', width: 10 },
			{ header: '名稱', key: 'name', width: 15 },
			{ header: '種類', key: 'type', width: 10 },
			{ header: '品種', key: 'breed', width: 15 },
			{ header: '性別', key: 'gender', width: 10 },
			{ header: '生日', key: 'birthday', width: 15 },
			{ header: '體重', key: 'weight', width: 10 },
			{ header: '狀態', key: 'is_active', width: 10 },
			{ header: '備註', key: 'note', width: 25 },
			{ header: '飼主', key: 'username', width: 15 },
		];

		records.forEach((record: any) => {
			worksheet.addRow({
				id: record.id,
				name: record.name,
				type: petTypeMap[record.type] || record.type,
				breed: record.breed || '',
				gender: record.gender ? (genderMap[record.gender] || record.gender) : '',
				birthday: record.birthday ? new Date(record.birthday).toLocaleDateString() : '',
				weight: record.weight || '',
				is_active: record.is_active ? '啟用' : '停用',
				note: record.note || '',
				username: record.user?.username || '',
			});
		});

		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			'attachment; filename=pets.xlsx',
		);

		await workbook.xlsx.write(res);
		res.end();
	}

	@Get(':id')
	findOne(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.petService.findOne(+id, user.id, user.role === 'admin');
	}

	@Put(':id')
	update(
		@Param('id') id: string,
		@Req() req: Request,
		@Body() dto: UpdatePetDto,
	) {
		const user = req.user as any;
		return this.petService.update(+id, dto, user.id, user.role === 'admin');
	}

	@Delete(':id')
	remove(@Param('id') id: string, @Req() req: Request) {
		const user = req.user as any;
		return this.petService.remove(+id, user.id, user.role === 'admin');
	}
}
