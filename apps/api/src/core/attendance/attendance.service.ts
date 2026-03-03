import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { CreateBatchAttendanceDto } from './dto/create-batch-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AttendanceService {
	constructor(private prisma: PrismaService) {}

	async create(createAttendanceDto: CreateAttendanceDto) {
		return this.prisma.attendance.create({
			data: createAttendanceDto,
		});
	}

	async findAll(query: Prisma.AttendanceFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.attendance.findMany({ ...query, where });
	}

	async count(where: Prisma.AttendanceWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.attendance.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.attendance.findUnique({
			where: { id },
			include: {
				student: true,
			},
		});
		if (!record) throw new NotFoundException('找不到該考勤紀錄');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此考勤紀錄');
		}
		return record;
	}

	async update(id: number, updateAttendanceDto: UpdateAttendanceDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.attendance.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該考勤紀錄');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此考勤紀錄');
		}
		return this.prisma.attendance.update({
			where: { id },
			data: updateAttendanceDto,
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.attendance.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該考勤紀錄');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此考勤紀錄');
		}
		return this.prisma.attendance.delete({
			where: { id },
		});
	}

	async createBatch(createBatchAttendanceDto: CreateBatchAttendanceDto) {
		const { course_id, date, records } = createBatchAttendanceDto;

		return this.prisma.$transaction(
			records.map((record) =>
				this.prisma.attendance.create({
					data: {
						student_id: record.student_id,
						date: date,
						status: record.status,
					},
				}),
			),
		);
	}

	async exportAttendance(courseId: number | undefined, userId: number, isAdmin: boolean) {
		const where: Prisma.AttendanceWhereInput = {};
		if (courseId) where.student = { course_id: courseId };
		if (!isAdmin) where.user_id = userId;
		return this.prisma.attendance.findMany({
			where,
			include: { student: true },
			orderBy: { date: 'desc' },
		});
	}

	async getStatistics(course_id: number | undefined, userId: number, isAdmin: boolean) {
		const where: Prisma.AttendanceWhereInput = {};
		if (course_id) where.student = { course_id };
		if (!isAdmin) where.user_id = userId;

		const attendances = await this.prisma.attendance.findMany({
			where,
			include: { student: true },
		});

		const studentStats = new Map<
			number,
			{
				name: string;
				attendance: number;
				absent: number;
				late: number;
				excused: number;
				total: number;
			}
		>();

		for (const record of attendances) {
			const sid = record.student_id;
			if (!studentStats.has(sid)) {
				studentStats.set(sid, {
					name: record.student.name,
					attendance: 0,
					absent: 0,
					late: 0,
					excused: 0,
					total: 0,
				});
			}
			const stats = studentStats.get(sid)!;
			stats[record.status]++;
			stats.total++;
		}

		return Array.from(studentStats.entries()).map(
			([student_id, stats]) => ({
				student_id,
				...stats,
				attendanceRate:
					stats.total > 0 ? stats.attendance / stats.total : 0,
			}),
		);
	}
}
