import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
	constructor(private prisma: PrismaService) {}

	async getStatistics(userId: number, isAdmin: boolean) {
		const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
		const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

		const userFilter = isAdmin ? {} : { user_id: userId };

		const [
			totalSchools,
			activeSchools,
			totalCourses,
			totalStudents,
			activeStudents,
			todayAttendanceCount,
			todayTotalCount,
		] = await Promise.all([
			this.prisma.school.count({ where: userFilter }),
			this.prisma.school.count({ where: { ...userFilter, is_active: true } }),
			this.prisma.course.count({ where: userFilter }),
			this.prisma.student.count({ where: userFilter }),
			this.prisma.student.count({ where: { ...userFilter, is_active: true } }),
			this.prisma.attendance.count({
				where: {
					...userFilter,
					date: { gte: todayStart, lte: todayEnd },
					status: 'attendance',
				},
			}),
			this.prisma.attendance.count({
				where: {
					...userFilter,
					date: { gte: todayStart, lte: todayEnd },
				},
			}),
		]);

		const todayAttendanceRate =
			todayTotalCount > 0 ? todayAttendanceCount / todayTotalCount : 0;

		return {
			totalSchools,
			activeSchools,
			totalCourses,
			totalStudents,
			activeStudents,
			todayAttendanceRate,
			todayAttendanceCount,
			todayTotalCount,
		};
	}
}
