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
		return this.prisma.course.findMany(query);
	}

	async count(where: Prisma.CourseWhereInput) {
		return this.prisma.course.count({ where });
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
