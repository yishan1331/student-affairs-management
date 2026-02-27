import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.healthWeight.findMany({
			...query,
			where,
			include: { user: { select: { id: true, username: true } } },
		});
	}

	async count(where: Prisma.HealthWeightWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.healthWeight.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthWeight.findUnique({
			where: { id },
			include: { user: { select: { id: true, username: true } } },
		});
		if (!record) {
			throw new NotFoundException('找不到此資料');
		}
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此資料');
		}
		return record;
	}

	async update(id: number, dto: UpdateHealthWeightDto, userId: number, isAdmin: boolean) {
		const where = isAdmin ? { id } : { id, user_id: userId };
		try {
			return await this.prisma.healthWeight.update({ where, data: dto });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此資料或無權限修改');
			}
			throw error;
		}
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const where = isAdmin ? { id } : { id, user_id: userId };
		try {
			return await this.prisma.healthWeight.delete({ where });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此資料或無權限刪除');
			}
			throw error;
		}
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

		const [aggregate, totalRecords, records] = await Promise.all([
			this.prisma.healthWeight.aggregate({
				where,
				_avg: { weight: true },
				_min: { weight: true },
				_max: { weight: true },
			}),
			this.prisma.healthWeight.count({ where }),
			this.prisma.healthWeight.findMany({
				where,
				select: { date: true, weight: true, bmi: true },
				orderBy: { date: 'asc' },
			}),
		]);

		if (totalRecords === 0) {
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

		const latest = records[records.length - 1];

		return {
			totalRecords,
			latestWeight: latest.weight,
			latestBmi: latest.bmi,
			averageWeight: Math.round((aggregate._avg.weight ?? 0) * 100) / 100,
			minWeight: aggregate._min.weight ?? 0,
			maxWeight: aggregate._max.weight ?? 0,
			trend: records.map((r) => ({
				date: r.date,
				weight: r.weight,
				bmi: r.bmi,
			})),
		};
	}
}
