import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeacherSalaryConfigDto } from './dto/create-teacher-salary-config.dto';
import { UpdateTeacherSalaryConfigDto } from './dto/update-teacher-salary-config.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeacherSalaryConfigService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateTeacherSalaryConfigDto) {
		return this.prisma.teacherSalaryConfig.create({ data: dto });
	}

	async findAll(query: Prisma.TeacherSalaryConfigFindManyArgs) {
		return this.prisma.teacherSalaryConfig.findMany({
			...query,
			include: { course: { include: { school: true } }, salaryBase: true },
		});
	}

	async count(where: Prisma.TeacherSalaryConfigWhereInput) {
		return this.prisma.teacherSalaryConfig.count({ where });
	}

	async findOne(id: number) {
		return this.prisma.teacherSalaryConfig.findUnique({
			where: { id },
			include: { course: { include: { school: true } }, salaryBase: true },
		});
	}

	async update(id: number, dto: UpdateTeacherSalaryConfigDto) {
		return this.prisma.teacherSalaryConfig.update({ where: { id }, data: dto });
	}

	async remove(id: number) {
		return this.prisma.teacherSalaryConfig.delete({ where: { id } });
	}

	// Calculate salary statistics by school
	async getStatistics(schoolId?: number) {
		const where = schoolId ? { course: { school_id: schoolId } } : {};

		const configs = await this.prisma.teacherSalaryConfig.findMany({
			where,
			include: {
				course: {
					include: {
						school: true,
					},
				},
				salaryBase: true,
			},
		});

		// Group by school
		const schoolStats = new Map<number, {
			schoolName: string;
			courses: {
				courseId: number;
				courseName: string;
				salaryBaseName: string;
				hourlyRate: number;
				duration: number;
				sessionsPerWeek: number;
				weeklyPay: number;
				monthlyPay: number;
			}[];
			totalMonthlyPay: number;
		}>();

		for (const config of configs) {
			const school = config.course.school;
			const sid = school.id;

			if (!schoolStats.has(sid)) {
				schoolStats.set(sid, {
					schoolName: school.name,
					courses: [],
					totalMonthlyPay: 0,
				});
			}

			const stats = schoolStats.get(sid)!;
			const hoursPerSession = config.course.duration / 60;
			const sessionsPerWeek = config.course.day_of_week.split(',').length;
			const weeklyPay = hoursPerSession * config.salaryBase.hourly_rate * sessionsPerWeek;
			const monthlyPay = weeklyPay * 4; // approximate 4 weeks per month

			stats.courses.push({
				courseId: config.course.id,
				courseName: config.course.name,
				salaryBaseName: config.salaryBase.name,
				hourlyRate: config.salaryBase.hourly_rate,
				duration: config.course.duration,
				sessionsPerWeek,
				weeklyPay: Math.round(weeklyPay * 100) / 100,
				monthlyPay: Math.round(monthlyPay * 100) / 100,
			});

			stats.totalMonthlyPay += monthlyPay;
		}

		// Convert to array
		return Array.from(schoolStats.entries()).map(([schoolId, stats]) => ({
			schoolId,
			schoolName: stats.schoolName,
			courses: stats.courses,
			totalMonthlyPay: Math.round(stats.totalMonthlyPay * 100) / 100,
		}));
	}
}
