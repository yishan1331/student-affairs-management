import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthSymptomDto } from './dto/create-health-symptom.dto';
import { UpdateHealthSymptomDto } from './dto/update-health-symptom.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HealthSymptomService {
	constructor(private prisma: PrismaService) {}

	private userAccessWhere(userId: number): Prisma.HealthSymptomWhereInput {
		return {
			OR: [
				{ user_id: userId },
				{ pet: { petUsers: { some: { user_id: userId } } } },
			],
		};
	}

	async create(userId: number, dto: CreateHealthSymptomDto) {
		if (dto.pet_id) {
			const petUser = await this.prisma.petUser.findUnique({
				where: { pet_id_user_id: { pet_id: dto.pet_id, user_id: userId } },
			});
			if (!petUser) {
				throw new ForbiddenException('此寵物不存在或您無權存取');
			}
		}
		return this.prisma.healthSymptom.create({
			data: {
				...dto,
				user_id: userId,
			},
		});
	}

	async findAll(query: Prisma.HealthSymptomFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, ...this.userAccessWhere(userId) };
		return this.prisma.healthSymptom.findMany({
			...query,
			where,
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
		});
	}

	async count(where: Prisma.HealthSymptomWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, ...this.userAccessWhere(userId) };
		return this.prisma.healthSymptom.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.healthSymptom.findUnique({
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
			if (record.pet_id) {
				const petUser = await this.prisma.petUser.findUnique({
					where: { pet_id_user_id: { pet_id: record.pet_id, user_id: userId } },
				});
				if (!petUser) {
					throw new ForbiddenException('無權限存取此資料');
				}
			} else {
				throw new ForbiddenException('無權限存取此資料');
			}
		}
		return record;
	}

	async update(id: number, dto: UpdateHealthSymptomDto, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			await this.findOne(id, userId, false);
		}
		try {
			return await this.prisma.healthSymptom.update({ where: { id }, data: dto });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此資料或無權限修改');
			}
			throw error;
		}
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			await this.findOne(id, userId, false);
		}
		try {
			return await this.prisma.healthSymptom.delete({ where: { id } });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此資料或無權限刪除');
			}
			throw error;
		}
	}

	async exportData(userId: number, isAdmin: boolean, petId?: number | null) {
		const where: Prisma.HealthSymptomWhereInput = {
			...(isAdmin ? {} : this.userAccessWhere(userId)),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};
		return this.prisma.healthSymptom.findMany({
			where,
			include: {
				user: { select: { id: true, username: true } },
				pet: { select: { id: true, name: true, type: true } },
			},
			orderBy: { date: 'desc' },
		});
	}

	async getTrend(userId: number, isAdmin: boolean, period: string, date: string, petId?: number | null) {
		// 解析日期字串，避免時區問題（支援 YYYY-MM-DD 及 ISO 格式）
		const dateOnly = date.includes('T') ? date.slice(0, 10) : date;
		const parts = dateOnly.split('-');
		const y = parseInt(parts[0]);
		const m = parseInt(parts[1]) - 1; // 0-indexed
		const d = parseInt(parts[2]);

		let startStr: string;
		let endStr: string;

		if (period === 'day') {
			startStr = dateOnly;
			endStr = dateOnly;
		} else if (period === 'month') {
			const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
			startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
			endStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
		} else {
			// week
			const day = new Date(Date.UTC(y, m, d)).getUTCDay();
			const diffToMonday = day === 0 ? -6 : 1 - day;
			const mon = new Date(Date.UTC(y, m, d + diffToMonday));
			const sun = new Date(Date.UTC(mon.getUTCFullYear(), mon.getUTCMonth(), mon.getUTCDate() + 6));
			startStr = `${mon.getUTCFullYear()}-${String(mon.getUTCMonth() + 1).padStart(2, '0')}-${String(mon.getUTCDate()).padStart(2, '0')}`;
			endStr = `${sun.getUTCFullYear()}-${String(sun.getUTCMonth() + 1).padStart(2, '0')}-${String(sun.getUTCDate()).padStart(2, '0')}`;
		}

		const startDate = new Date(`${startStr}T00:00:00.000Z`);
		const endDate = new Date(`${endStr}T23:59:59.999Z`);

		const where: Prisma.HealthSymptomWhereInput = {
			...(isAdmin ? {} : this.userAccessWhere(userId)),
			...(petId !== undefined ? { pet_id: petId } : {}),
			date: { gte: startDate, lte: endDate },
		};

		const records = await this.prisma.healthSymptom.findMany({
			where,
			select: { date: true, time: true, symptom_type: true, severity: true, frequency: true, is_recurring: true },
			orderBy: { date: 'asc' },
		});

		let data: any[];

		if (period === 'day') {
			const hourly: Record<number, { total: number; severeCount: number; symptomTypes: Record<string, number> }> = {};
			for (let h = 0; h < 24; h++) {
				hourly[h] = { total: 0, severeCount: 0, symptomTypes: {} };
			}
			for (const r of records) {
				const hour = r.time ? parseInt(r.time.split(':')[0], 10) : r.date.getUTCHours();
				if (hourly[hour]) {
					hourly[hour].total += r.frequency;
					if (r.severity === 'severe') hourly[hour].severeCount++;
					hourly[hour].symptomTypes[r.symptom_type] = (hourly[hour].symptomTypes[r.symptom_type] || 0) + r.frequency;
				}
			}
			data = Object.entries(hourly).map(([h, v]) => ({
				date: `${String(h).padStart(2, '0')}:00`,
				...v,
			}));
		} else {
			const grouped: Record<string, { total: number; severeCount: number; symptomTypes: Record<string, number> }> = {};
			for (const r of records) {
				const key = r.date.toISOString().slice(0, 10);
				if (!grouped[key]) {
					grouped[key] = { total: 0, severeCount: 0, symptomTypes: {} };
				}
				grouped[key].total += r.frequency;
				if (r.severity === 'severe') grouped[key].severeCount++;
				grouped[key].symptomTypes[r.symptom_type] = (grouped[key].symptomTypes[r.symptom_type] || 0) + r.frequency;
			}

			data = [];
			const allDates = this.generateDateRange(startStr, endStr);
			for (const key of allDates) {
				const g = grouped[key];
				data.push({
					date: key,
					total: g ? g.total : 0,
					severeCount: g ? g.severeCount : 0,
					symptomTypes: g ? g.symptomTypes : {},
				});
			}
		}

		// Summary
		const totalRecords = records.length;
		const totalFrequency = records.reduce((sum, r) => sum + r.frequency, 0);
		const severeCount = records.filter((r) => r.severity === 'severe').length;
		const recurringCount = records.filter((r) => r.is_recurring).length;
		const dayCount = period === 'day' ? 1 : data.length;

		// Top symptom types
		const symptomCounts: Record<string, number> = {};
		for (const r of records) {
			symptomCounts[r.symptom_type] = (symptomCounts[r.symptom_type] || 0) + r.frequency;
		}
		const topSymptoms = Object.entries(symptomCounts)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 3)
			.map(([type, count]) => ({ type, count }));

		// Severity distribution
		const severityDist: Record<string, number> = { mild: 0, moderate: 0, severe: 0 };
		for (const r of records) {
			severityDist[r.severity]++;
		}

		return {
			period,
			startDate: startStr,
			endDate: endStr,
			data,
			summary: {
				totalRecords,
				totalFrequency,
				avgDaily: dayCount > 0 ? Math.round((totalFrequency / dayCount) * 100) / 100 : 0,
				severeCount,
				severeRate: totalRecords > 0 ? Math.round((severeCount / totalRecords) * 10000) / 100 : 0,
				recurringCount,
				recurringRate: totalRecords > 0 ? Math.round((recurringCount / totalRecords) * 10000) / 100 : 0,
				topSymptoms,
				severityDistribution: severityDist,
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
		const where: Prisma.HealthSymptomWhereInput = {
			...(isAdmin ? {} : this.userAccessWhere(userId)),
			...(petId !== undefined ? { pet_id: petId } : {}),
		};

		const [totalRecords, symptomTypeGroups, severityGroups, recurringCount] = await Promise.all([
			this.prisma.healthSymptom.count({ where }),
			this.prisma.healthSymptom.groupBy({
				by: ['symptom_type'],
				where,
				_count: true,
				_sum: { frequency: true },
			}),
			this.prisma.healthSymptom.groupBy({
				by: ['severity'],
				where,
				_count: true,
			}),
			this.prisma.healthSymptom.count({ where: { ...where, is_recurring: true } }),
		]);

		if (totalRecords === 0) {
			return {
				totalRecords: 0,
				symptomTypeDistribution: {},
				severityDistribution: { mild: 0, moderate: 0, severe: 0 },
				recurringRate: 0,
				topSymptoms: [],
			};
		}

		const symptomTypeDistribution: Record<string, number> = {};
		for (const group of symptomTypeGroups) {
			symptomTypeDistribution[group.symptom_type] = group._count;
		}

		const severityDistribution: Record<string, number> = { mild: 0, moderate: 0, severe: 0 };
		for (const group of severityGroups) {
			severityDistribution[group.severity] = group._count;
		}

		const topSymptoms = symptomTypeGroups
			.sort((a, b) => (b._sum?.frequency || 0) - (a._sum?.frequency || 0))
			.slice(0, 3)
			.map((g) => ({ type: g.symptom_type, count: g._sum?.frequency || 0 }));

		return {
			totalRecords,
			symptomTypeDistribution,
			severityDistribution,
			recurringRate: Math.round((recurringCount / totalRecords) * 10000) / 100,
			topSymptoms,
		};
	}
}
