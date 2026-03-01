import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthDietDto } from './dto/create-health-diet.dto';
import { UpdateHealthDietDto } from './dto/update-health-diet.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HealthDietService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreateHealthDietDto) {
		if (dto.pet_id) {
			const pet = await this.prisma.pet.findFirst({
				where: { id: dto.pet_id, user_id: userId },
			});
			if (!pet) {
				throw new ForbiddenException('此寵物不存在或不屬於您');
			}
		}
		return this.prisma.healthDiet.create({
			data: {
				...dto,
				user_id: userId,
			},
		});
	}

	async findAll(query: Prisma.HealthDietFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.healthDiet.findMany({
			...query,
			where,
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
		});
	}

	async count(where: Prisma.HealthDietWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.healthDiet.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthDiet.findUnique({
			where: { id },
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
		});
		if (!record) {
			throw new NotFoundException('找不到此資料');
		}
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此資料');
		}
		return record;
	}

	async update(id: number, dto: UpdateHealthDietDto, userId: number, isAdmin: boolean) {
		const where = isAdmin ? { id } : { id, user_id: userId };
		try {
			return await this.prisma.healthDiet.update({ where, data: dto });
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
			return await this.prisma.healthDiet.delete({ where });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此資料或無權限刪除');
			}
			throw error;
		}
	}

	async exportData(userId: number, isAdmin: boolean, petId?: number | null) {
		const where: Prisma.HealthDietWhereInput = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};
		return this.prisma.healthDiet.findMany({
			where,
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
			orderBy: { date: 'desc' },
		});
	}

	async getStatistics(userId: number, isAdmin: boolean, petId?: number | null) {
		const where: Prisma.HealthDietWhereInput = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};

		const [totalRecords, mealTypeGroups, calorieStats] = await Promise.all([
			this.prisma.healthDiet.count({ where }),
			this.prisma.healthDiet.groupBy({
				by: ['meal_type'],
				where,
				_count: true,
			}),
			this.prisma.healthDiet.aggregate({
				where: { ...where, calories: { not: null } },
				_avg: { calories: true },
				_sum: { calories: true },
				_count: true,
			}),
		]);

		if (totalRecords === 0) {
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
			breakfast: 0,
			lunch: 0,
			dinner: 0,
			snack: 0,
		};
		for (const group of mealTypeGroups) {
			mealTypeDistribution[group.meal_type] = group._count;
		}

		return {
			totalRecords,
			mealTypeDistribution,
			averageCalories:
				calorieStats._count > 0
					? Math.round((calorieStats._avg.calories ?? 0) * 100) / 100
					: 0,
			totalCalories: Math.round((calorieStats._sum.calories ?? 0) * 100) / 100,
		};
	}
}
