import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
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
}
