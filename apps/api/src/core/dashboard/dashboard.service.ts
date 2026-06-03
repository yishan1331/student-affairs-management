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
			this.prisma.school.count({ where: { ...userFilter, deleted_at: null } }),
			this.prisma.school.count({ where: { ...userFilter, is_active: true, deleted_at: null } }),
			this.prisma.course.count({ where: { ...userFilter, deleted_at: null, school: { deleted_at: null } } }),
			this.prisma.student.count({ where: { ...userFilter, deleted_at: null, course: { deleted_at: null, school: { deleted_at: null } } } }),
			this.prisma.student.count({ where: { ...userFilter, is_active: true, deleted_at: null, course: { deleted_at: null, school: { deleted_at: null } } } }),
			this.prisma.attendance.count({
				where: {
					...userFilter,
					date: { gte: todayStart, lte: todayEnd },
					status: 'attendance',
					student: { is: { deleted_at: null, course: { deleted_at: null, school: { deleted_at: null } } } },
				},
			}),
			this.prisma.attendance.count({
				where: {
					...userFilter,
					date: { gte: todayStart, lte: todayEnd },
					student: { is: { deleted_at: null, course: { deleted_at: null, school: { deleted_at: null } } } },
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
