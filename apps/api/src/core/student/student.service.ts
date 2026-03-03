import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudentService {
	constructor(private prisma: PrismaService) {}

	async create(createStudentDto: CreateStudentDto) {
		return this.prisma.student.create({
			data: createStudentDto,
		});
	}

	async findAll(query: Prisma.StudentFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.student.findMany({ ...query, where });
	}

	async count(where: Prisma.StudentWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.student.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.student.findUnique({
			where: { id },
			include: {
				course: true,
				attendances: true,
				gradesheets: true,
			},
		});
		if (!record) throw new NotFoundException('找不到該學生');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此學生');
		}
		return record;
	}

	async update(id: number, updateStudentDto: UpdateStudentDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.student.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該學生');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此學生');
		}
		return this.prisma.student.update({
			where: { id },
			data: updateStudentDto,
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.student.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該學生');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此學生');
		}
		return this.prisma.student.delete({
			where: { id },
		});
	}

	async exportStudents(courseId: number | undefined, userId: number, isAdmin: boolean) {
		const where: Prisma.StudentWhereInput = {};
		if (courseId) where.course_id = courseId;
		if (!isAdmin) where.user_id = userId;
		return this.prisma.student.findMany({
			where,
			include: { course: true },
			orderBy: { id: 'asc' },
		});
	}

	async importStudents(students: { name: string; number: string; gender: string; course_id: number; modifier_id: number }[]) {
		return this.prisma.$transaction(
			students.map((student) =>
				this.prisma.student.create({ data: student }),
			),
		);
	}
}
