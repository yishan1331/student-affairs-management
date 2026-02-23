import { Injectable } from '@nestjs/common';
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

	async findAll(query: Prisma.StudentFindManyArgs) {
		return this.prisma.student.findMany(query);
	}

	async findOne(id: number) {
		return this.prisma.student.findUnique({
			where: { id },
			include: {
				course: true,
				attendances: true,
				gradesheets: true,
			},
		});
	}

	async update(id: number, updateStudentDto: UpdateStudentDto) {
		return this.prisma.student.update({
			where: { id },
			data: updateStudentDto,
		});
	}

	async remove(id: number) {
		return this.prisma.student.delete({
			where: { id },
		});
	}
}
