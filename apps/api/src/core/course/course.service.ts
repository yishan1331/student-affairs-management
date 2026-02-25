import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseService {
	constructor(private prisma: PrismaService) {}

	async create(createCourseDto: CreateCourseDto) {
		return this.prisma.course.create({
			data: createCourseDto,
		});
	}

	async findAll(query: Prisma.CourseFindManyArgs) {
		return this.prisma.course.findMany({
			...query,
			include: { school: true },
		});
	}

	async count(where: Prisma.CourseWhereInput) {
		return this.prisma.course.count({ where });
	}

	async findSchedule(filters: {
		school_id?: number;
		grade?: number;
		name?: string;
		day_of_week?: string;
	}) {
		const where: Prisma.CourseWhereInput = {};

		if (filters.school_id) {
			where.school_id = filters.school_id;
		}
		if (filters.grade !== undefined) {
			where.grade = filters.grade;
		}
		if (filters.name) {
			where.name = { contains: filters.name };
		}
		if (filters.day_of_week) {
			where.day_of_week = { contains: filters.day_of_week };
		}

		return this.prisma.course.findMany({
			where,
			include: { school: true },
			orderBy: [{ start_time: 'asc' }, { day_of_week: 'asc' }],
		});
	}

	async findOne(id: number) {
		return this.prisma.course.findUnique({
			where: { id },
			include: {
				school: true,
				students: true,
			},
		});
	}

	async update(id: number, updateCourseDto: UpdateCourseDto) {
		return this.prisma.course.update({
			where: { id },
			data: updateCourseDto,
		});
	}

	async remove(id: number) {
		return this.prisma.course.delete({
			where: { id },
		});
	}
}
