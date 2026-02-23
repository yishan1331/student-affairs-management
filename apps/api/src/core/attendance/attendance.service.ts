import { Injectable } from '@nestjs/common';
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

	async findAll(query: Prisma.AttendanceFindManyArgs) {
		return this.prisma.attendance.findMany(query);
	}

	async findOne(id: number) {
		return this.prisma.attendance.findUnique({
			where: { id },
			include: {
				student: true,
			},
		});
	}

	async update(id: number, updateAttendanceDto: UpdateAttendanceDto) {
		return this.prisma.attendance.update({
			where: { id },
			data: updateAttendanceDto,
		});
	}

	async remove(id: number) {
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

	async getStatistics(course_id?: number) {
		const where = course_id ? { student: { course_id } } : {};

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
