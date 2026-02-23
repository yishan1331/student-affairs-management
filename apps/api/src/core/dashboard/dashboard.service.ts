import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
	constructor(private prisma: PrismaService) {}

	async getStatistics() {
		const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
		const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

		const [
			totalSchools,
			activeSchools,
			totalCourses,
			totalStudents,
			activeStudents,
			todayAttendanceCount,
			todayTotalCount,
		] = await Promise.all([
			this.prisma.school.count(),
			this.prisma.school.count({ where: { is_active: true } }),
			this.prisma.course.count(),
			this.prisma.student.count(),
			this.prisma.student.count({ where: { is_active: true } }),
			this.prisma.attendance.count({
				where: {
					date: { gte: todayStart, lte: todayEnd },
					status: 'attendance',
				},
			}),
			this.prisma.attendance.count({
				where: {
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
