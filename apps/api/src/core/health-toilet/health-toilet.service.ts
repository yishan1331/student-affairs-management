import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthToiletDto } from './dto/create-health-toilet.dto';
import { UpdateHealthToiletDto } from './dto/update-health-toilet.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HealthToiletService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreateHealthToiletDto) {
		return this.prisma.healthToilet.create({
			data: {
				...dto,
				user_id: userId,
			},
		});
	}

	async findAll(query: Prisma.HealthToiletFindManyArgs, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			query.where = { ...query.where, user_id: userId };
		}
		return this.prisma.healthToilet.findMany({
			...query,
			include: { user: { select: { id: true, username: true } } },
		});
	}

	async count(where: Prisma.HealthToiletWhereInput, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			where = { ...where, user_id: userId };
		}
		return this.prisma.healthToilet.count({ where });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthToilet.findUnique({
			where: { id },
			include: { user: { select: { id: true, username: true } } },
		});
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此資料');
		}
		return record;
	}

	async update(id: number, dto: UpdateHealthToiletDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthToilet.findUnique({ where: { id } });
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此資料');
		}
		return this.prisma.healthToilet.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthToilet.findUnique({ where: { id } });
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此資料');
		}
		return this.prisma.healthToilet.delete({ where: { id } });
	}

	async exportData(userId: number, isAdmin: boolean) {
		const where = isAdmin ? {} : { user_id: userId };
		return this.prisma.healthToilet.findMany({
			where,
			include: { user: { select: { id: true, username: true } } },
			orderBy: { date: 'desc' },
		});
	}

	async getStatistics(userId: number, isAdmin: boolean) {
		const where = isAdmin ? {} : { user_id: userId };
		const records = await this.prisma.healthToilet.findMany({ where });

		if (records.length === 0) {
			return {
				totalRecords: 0,
				typeDistribution: {
					urination: 0,
					defecation: 0,
				},
				normalRate: 0,
				abnormalCount: 0,
			};
		}

		const typeDistribution = {
			urination: records.filter((r) => r.type === 'urination').length,
			defecation: records.filter((r) => r.type === 'defecation').length,
		};

		const normalCount = records.filter((r) => r.is_normal).length;
		const abnormalCount = records.length - normalCount;

		return {
			totalRecords: records.length,
			typeDistribution,
			normalRate: Math.round((normalCount / records.length) * 10000) / 100,
			abnormalCount,
		};
	}
}
