import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthWeightDto } from './dto/create-health-weight.dto';
import { UpdateHealthWeightDto } from './dto/update-health-weight.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HealthWeightService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreateHealthWeightDto) {
		if (dto.pet_id) {
			const pet = await this.prisma.pet.findFirst({
				where: { id: dto.pet_id, user_id: userId },
			});
			if (!pet) {
				throw new ForbiddenException('此寵物不存在或不屬於您');
			}
		}
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
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
		});
	}

	async count(where: Prisma.HealthWeightWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.healthWeight.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthWeight.findUnique({
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

	async exportData(userId: number, isAdmin: boolean, petId?: number | null) {
		const where: Prisma.HealthWeightWhereInput = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};
		return this.prisma.healthWeight.findMany({
			where,
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
			orderBy: { date: 'desc' },
		});
	}

	async getTrend(userId: number, isAdmin: boolean, period: string, date: string, petId?: number | null) {
		// 使用純字串日期計算避免時區問題
		const baseDate = new Date(date);
		const y = baseDate.getFullYear();
		const m = baseDate.getMonth();
		const d = baseDate.getDate();

		let startStr: string;
		let endStr: string;

		if (period === 'day') {
			const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
			startStr = ds;
			endStr = ds;
		} else if (period === 'month') {
			const lastDay = new Date(y, m + 1, 0).getDate();
			startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
			endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
		} else {
			// week
			const day = baseDate.getDay();
			const diffToMonday = day === 0 ? -6 : 1 - day;
			const mon = new Date(y, m, d + diffToMonday);
			const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
			startStr = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
			endStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
		}

		const startDate = new Date(`${startStr}T00:00:00.000Z`);
		const endDate = new Date(`${endStr}T23:59:59.999Z`);

		const where = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
			date: { gte: startDate, lte: endDate },
		};

		const records = await this.prisma.healthWeight.findMany({
			where,
			select: { date: true, weight: true, bmi: true },
			orderBy: { date: 'asc' },
		});

		let data: { date: string; weight: number | null; bmi: number | null; count: number }[];

		if (period === 'day') {
			data = records.map((r) => ({
				date: r.date.toISOString(),
				weight: r.weight,
				bmi: r.bmi,
				count: 1,
			}));
		} else {
			// 按日分組
			const grouped: Record<string, { totalWeight: number; totalBmi: number; count: number; bmiCount: number }> = {};
			for (const r of records) {
				const key = r.date.toISOString().slice(0, 10);
				if (!grouped[key]) {
					grouped[key] = { totalWeight: 0, totalBmi: 0, count: 0, bmiCount: 0 };
				}
				grouped[key].totalWeight += r.weight;
				grouped[key].count += 1;
				if (r.bmi != null) {
					grouped[key].totalBmi += r.bmi;
					grouped[key].bmiCount += 1;
				}
			}

			// 生成日期列表
			data = [];
			const allDates = this.generateDateRange(startStr, endStr);
			for (const key of allDates) {
				const g = grouped[key];
				data.push({
					date: key,
					weight: g ? Math.round((g.totalWeight / g.count) * 100) / 100 : null,
					bmi: g && g.bmiCount > 0 ? Math.round((g.totalBmi / g.bmiCount) * 100) / 100 : null,
					count: g ? g.count : 0,
				});
			}
		}

		const validWeights = data.filter((d) => d.weight !== null).map((d) => d.weight as number);
		const summary = validWeights.length > 0
			? {
				avgWeight: Math.round((validWeights.reduce((a, b) => a + b, 0) / validWeights.length) * 100) / 100,
				minWeight: Math.min(...validWeights),
				maxWeight: Math.max(...validWeights),
				weightChange: validWeights.length >= 2
					? Math.round((validWeights[validWeights.length - 1] - validWeights[0]) * 100) / 100
					: 0,
			}
			: { avgWeight: 0, minWeight: 0, maxWeight: 0, weightChange: 0 };

		return {
			period,
			startDate: startStr,
			endDate: endStr,
			data,
			summary,
		};
	}

	private generateDateRange(startStr: string, endStr: string): string[] {
		const dates: string[] = [];
		const [sy, sm, sd] = startStr.split('-').map(Number);
		const end = new Date(Date.UTC(Number(endStr.split('-')[0]), Number(endStr.split('-')[1]) - 1, Number(endStr.split('-')[2])));
		const cursor = new Date(Date.UTC(sy, sm - 1, sd));
		while (cursor <= end) {
			dates.push(cursor.toISOString().slice(0, 10));
			cursor.setUTCDate(cursor.getUTCDate() + 1);
		}
		return dates;
	}

	async getStatistics(userId: number, isAdmin: boolean, petId?: number | null) {
		const where: Prisma.HealthWeightWhereInput = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};

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
