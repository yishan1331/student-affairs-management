import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthWeightDto } from './dto/create-health-weight.dto';
import { UpdateHealthWeightDto } from './dto/update-health-weight.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HealthWeightService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreateHealthWeightDto) {
		return this.prisma.healthWeight.create({
			data: {
				...dto,
				user_id: userId,
			},
		});
	}

	async findAll(query: Prisma.HealthWeightFindManyArgs, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			query.where = { ...query.where, user_id: userId };
		}
		return this.prisma.healthWeight.findMany({
			...query,
			include: { user: { select: { id: true, username: true } } },
		});
	}

	async count(where: Prisma.HealthWeightWhereInput, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			where = { ...where, user_id: userId };
		}
		return this.prisma.healthWeight.count({ where });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthWeight.findUnique({
			where: { id },
			include: { user: { select: { id: true, username: true } } },
		});
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此資料');
		}
		return record;
	}

	async update(id: number, dto: UpdateHealthWeightDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthWeight.findUnique({ where: { id } });
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此資料');
		}
		return this.prisma.healthWeight.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthWeight.findUnique({ where: { id } });
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此資料');
		}
		return this.prisma.healthWeight.delete({ where: { id } });
	}

	async exportData(userId: number, isAdmin: boolean) {
		const where = isAdmin ? {} : { user_id: userId };
		return this.prisma.healthWeight.findMany({
			where,
			include: { user: { select: { id: true, username: true } } },
			orderBy: { date: 'desc' },
		});
	}

	async getStatistics(userId: number, isAdmin: boolean) {
		const where = isAdmin ? {} : { user_id: userId };
		const records = await this.prisma.healthWeight.findMany({
			where,
			orderBy: { date: 'asc' },
		});

		if (records.length === 0) {
			return {
				totalRecords: 0,
				latestWeight: null,
				latestBmi: null,
				averageWeight: 0,
				minWeight: 0,
				maxWeight: 0,
				trend: [],
			};
		}

		const weights = records.map((r) => r.weight);
		const latest = records[records.length - 1];

		return {
			totalRecords: records.length,
			latestWeight: latest.weight,
			latestBmi: latest.bmi,
			averageWeight:
				Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 100) / 100,
			minWeight: Math.min(...weights),
			maxWeight: Math.max(...weights),
			trend: records.map((r) => ({
				date: r.date,
				weight: r.weight,
				bmi: r.bmi,
			})),
		};
	}
}
