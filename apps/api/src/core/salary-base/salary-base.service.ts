import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalaryBaseDto } from './dto/create-salary-base.dto';
import { UpdateSalaryBaseDto } from './dto/update-salary-base.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalaryBaseService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateSalaryBaseDto) {
		return this.prisma.salaryBase.create({ data: dto });
	}

	async findAll(query: Prisma.SalaryBaseFindManyArgs) {
		return this.prisma.salaryBase.findMany({
			...query,
			include: { school: true },
		});
	}

	async count(where: Prisma.SalaryBaseWhereInput) {
		return this.prisma.salaryBase.count({ where });
	}

	async findOne(id: number) {
		return this.prisma.salaryBase.findUnique({
			where: { id },
			include: { school: true, teacherSalaryConfigs: { include: { course: true } } },
		});
	}

	async update(id: number, dto: UpdateSalaryBaseDto) {
		return this.prisma.salaryBase.update({ where: { id }, data: dto });
	}

	async remove(id: number) {
		return this.prisma.salaryBase.delete({ where: { id } });
	}
}
