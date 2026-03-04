import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseService {
	constructor(private prisma: PrismaService) {}

	async create(createCourseDto: CreateCourseDto, userId: number) {
		return this.prisma.course.create({
			data: { ...createCourseDto, user_id: userId, modifier_id: userId },
		});
	}

	async findAll(query: Prisma.CourseFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.course.findMany({
			...query,
			where,
			include: { school: true },
		});
	}

	async count(where: Prisma.CourseWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.course.count({ where: finalWhere });
	}

	async findSchedule(filters: {
		school_id?: number;
		grade?: number;
		name?: string;
		day_of_week?: string;
	}, userId: number, isAdmin: boolean) {
		const where: Prisma.CourseWhereInput = {};

		if (!isAdmin) {
			where.user_id = userId;
		}
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

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.course.findUnique({
			where: { id },
			include: {
				school: true,
				students: true,
			},
		});
		if (!record) throw new NotFoundException('找不到該課程');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此課程');
		}
		return record;
	}

	async update(id: number, updateCourseDto: UpdateCourseDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.course.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該課程');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此課程');
		}
		return this.prisma.course.update({
			where: { id },
			data: { ...updateCourseDto, modifier_id: userId },
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.course.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該課程');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此課程');
		}
		return this.prisma.course.delete({
			where: { id },
		});
	}
}
