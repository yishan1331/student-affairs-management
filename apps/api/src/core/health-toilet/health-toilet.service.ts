import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
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
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.healthToilet.findMany({
			...query,
			where,
			include: { user: { select: { id: true, username: true } } },
		});
	}

	async count(where: Prisma.HealthToiletWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.healthToilet.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthToilet.findUnique({
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

	async update(id: number, dto: UpdateHealthToiletDto, userId: number, isAdmin: boolean) {
		const where = isAdmin ? { id } : { id, user_id: userId };
		try {
			return await this.prisma.healthToilet.update({ where, data: dto });
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
			return await this.prisma.healthToilet.delete({ where });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此資料或無權限刪除');
			}
			throw error;
		}
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
		const where: Prisma.HealthToiletWhereInput = isAdmin ? {} : { user_id: userId };

		const [totalRecords, typeGroups, normalCount] = await Promise.all([
			this.prisma.healthToilet.count({ where }),
			this.prisma.healthToilet.groupBy({
				by: ['type'],
				where,
				_count: true,
			}),
			this.prisma.healthToilet.count({ where: { ...where, is_normal: true } }),
		]);

		if (totalRecords === 0) {
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
			urination: 0,
			defecation: 0,
		};
		for (const group of typeGroups) {
			typeDistribution[group.type] = group._count;
		}

		return {
			totalRecords,
			typeDistribution,
			normalRate: Math.round((normalCount / totalRecords) * 10000) / 100,
			abnormalCount: totalRecords - normalCount,
		};
	}
}
