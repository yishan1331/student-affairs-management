import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchoolService {
	constructor(private prisma: PrismaService) {}

	async create(createSchoolDto: CreateSchoolDto) {
		return this.prisma.school.create({
			data: createSchoolDto,
		});
	}

	async findAll(query: Prisma.SchoolFindManyArgs) {
		return this.prisma.school.findMany(query);
	}

	async count(where: Prisma.SchoolWhereInput) {
		return this.prisma.school.count({ where });
	}

	async findOne(id: number) {
		return this.prisma.school.findUnique({
			where: { id },
			include: {
				courses: true,
			},
		});
	}

	async update(id: number, updateSchoolDto: UpdateSchoolDto) {
		return this.prisma.school.update({
			where: { id },
			data: updateSchoolDto,
		});
	}

	async remove(id: number) {
		return this.prisma.school.delete({
			where: { id },
		});
	}
}
