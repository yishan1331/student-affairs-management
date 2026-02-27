import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthDietDto } from './dto/create-health-diet.dto';
import { UpdateHealthDietDto } from './dto/update-health-diet.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HealthDietService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreateHealthDietDto) {
		return this.prisma.healthDiet.create({
			data: {
				...dto,
				user_id: userId,
			},
		});
	}

	async findAll(query: Prisma.HealthDietFindManyArgs, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			query.where = { ...query.where, user_id: userId };
		}
		return this.prisma.healthDiet.findMany({
			...query,
			include: { user: { select: { id: true, username: true } } },
		});
	}

	async count(where: Prisma.HealthDietWhereInput, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			where = { ...where, user_id: userId };
		}
		return this.prisma.healthDiet.count({ where });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthDiet.findUnique({
			where: { id },
			include: { user: { select: { id: true, username: true } } },
		});
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此資料');
		}
		return record;
	}

	async update(id: number, dto: UpdateHealthDietDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthDiet.findUnique({ where: { id } });
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此資料');
		}
		return this.prisma.healthDiet.update({
			where: { id },
			data: dto,
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthDiet.findUnique({ where: { id } });
		if (record && !isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此資料');
		}
		return this.prisma.healthDiet.delete({ where: { id } });
	}

	async exportData(userId: number, isAdmin: boolean) {
		const where = isAdmin ? {} : { user_id: userId };
		return this.prisma.healthDiet.findMany({
			where,
			include: { user: { select: { id: true, username: true } } },
			orderBy: { date: 'desc' },
		});
	}

	async getStatistics(userId: number, isAdmin: boolean) {
		const where = isAdmin ? {} : { user_id: userId };
		const records = await this.prisma.healthDiet.findMany({ where });

		if (records.length === 0) {
			return {
				totalRecords: 0,
				mealTypeDistribution: {
					breakfast: 0,
					lunch: 0,
					dinner: 0,
					snack: 0,
				},
				averageCalories: 0,
				totalCalories: 0,
			};
		}

		const mealTypeDistribution = {
			breakfast: records.filter((r) => r.meal_type === 'breakfast').length,
			lunch: records.filter((r) => r.meal_type === 'lunch').length,
			dinner: records.filter((r) => r.meal_type === 'dinner').length,
			snack: records.filter((r) => r.meal_type === 'snack').length,
		};

		const recordsWithCalories = records.filter((r) => r.calories != null);
		const totalCalories = recordsWithCalories.reduce((sum, r) => sum + (r.calories || 0), 0);

		return {
			totalRecords: records.length,
			mealTypeDistribution,
			averageCalories:
				recordsWithCalories.length > 0
					? Math.round((totalCalories / recordsWithCalories.length) * 100) / 100
					: 0,
			totalCalories: Math.round(totalCalories * 100) / 100,
		};
	}
}
