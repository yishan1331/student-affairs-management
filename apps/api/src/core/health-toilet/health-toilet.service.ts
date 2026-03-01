import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthToiletDto } from './dto/create-health-toilet.dto';
import { UpdateHealthToiletDto } from './dto/update-health-toilet.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HealthToiletService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreateHealthToiletDto) {
		if (dto.pet_id) {
			const pet = await this.prisma.pet.findFirst({
				where: { id: dto.pet_id, user_id: userId },
			});
			if (!pet) {
				throw new ForbiddenException('此寵物不存在或不屬於您');
			}
		}
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
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
		});
	}

	async count(where: Prisma.HealthToiletWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.healthToilet.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthToilet.findUnique({
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

	async exportData(userId: number, isAdmin: boolean, petId?: number | null) {
		const where: Prisma.HealthToiletWhereInput = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};
		return this.prisma.healthToilet.findMany({
			where,
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
			orderBy: { date: 'desc' },
		});
	}

	async getTrend(userId: number, isAdmin: boolean, period: string, date: string, petId?: number | null) {
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
			const day = baseDate.getDay();
			const diffToMonday = day === 0 ? -6 : 1 - day;
			const mon = new Date(y, m, d + diffToMonday);
			const sun = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 6);
			startStr = `${mon.getFullYear()}-${String(mon.getMonth() + 1).padStart(2, '0')}-${String(mon.getDate()).padStart(2, '0')}`;
			endStr = `${sun.getFullYear()}-${String(sun.getMonth() + 1).padStart(2, '0')}-${String(sun.getDate()).padStart(2, '0')}`;
		}

		const startDate = new Date(`${startStr}T00:00:00.000Z`);
		const endDate = new Date(`${endStr}T23:59:59.999Z`);

		const where: Prisma.HealthToiletWhereInput = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
			date: { gte: startDate, lte: endDate },
		};

		const records = await this.prisma.healthToilet.findMany({
			where,
			select: { date: true, time: true, type: true, is_normal: true },
			orderBy: { date: 'asc' },
		});

		let data: any[];

		if (period === 'day') {
			const hourly: Record<number, { urination: number; defecation: number; total: number; abnormalCount: number }> = {};
			for (let h = 0; h < 24; h++) {
				hourly[h] = { urination: 0, defecation: 0, total: 0, abnormalCount: 0 };
			}
			for (const r of records) {
				const hour = r.time ? parseInt(r.time.split(':')[0], 10) : r.date.getUTCHours();
				if (hourly[hour]) {
					if (r.type === 'urination') hourly[hour].urination++;
					else hourly[hour].defecation++;
					hourly[hour].total++;
					if (!r.is_normal) hourly[hour].abnormalCount++;
				}
			}
			data = Object.entries(hourly).map(([h, v]) => ({
				date: `${String(h).padStart(2, '0')}:00`,
				...v,
			}));
		} else {
			const grouped: Record<string, { urination: number; defecation: number; total: number; abnormalCount: number }> = {};
			for (const r of records) {
				const key = r.date.toISOString().slice(0, 10);
				if (!grouped[key]) {
					grouped[key] = { urination: 0, defecation: 0, total: 0, abnormalCount: 0 };
				}
				if (r.type === 'urination') grouped[key].urination++;
				else grouped[key].defecation++;
				grouped[key].total++;
				if (!r.is_normal) grouped[key].abnormalCount++;
			}

			data = [];
			const allDates = this.generateDateRange(startStr, endStr);
			for (const key of allDates) {
				const g = grouped[key];
				data.push({
					date: key,
					urination: g ? g.urination : 0,
					defecation: g ? g.defecation : 0,
					total: g ? g.total : 0,
					abnormalCount: g ? g.abnormalCount : 0,
				});
			}
		}

		const totalRecords = records.length;
		const normalCount = records.filter((r) => r.is_normal).length;
		const urinationTotal = records.filter((r) => r.type === 'urination').length;
		const defecationTotal = records.filter((r) => r.type === 'defecation').length;
		const dayCount = period === 'day' ? 1 : data.length;

		return {
			period,
			startDate: startStr,
			endDate: endStr,
			data,
			summary: {
				totalRecords,
				avgDaily: dayCount > 0 ? Math.round((totalRecords / dayCount) * 100) / 100 : 0,
				normalRate: totalRecords > 0 ? Math.round((normalCount / totalRecords) * 10000) / 100 : 0,
				urinationTotal,
				defecationTotal,
			},
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
		const where: Prisma.HealthToiletWhereInput = {
			...(isAdmin ? {} : { user_id: userId }),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};

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
