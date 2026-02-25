import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalaryBaseDto } from './dto/create-salary-base.dto';
import { UpdateSalaryBaseDto } from './dto/update-salary-base.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalaryBaseService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateSalaryBaseDto) {
		const { school_ids, ...data } = dto;
		return this.prisma.salaryBase.create({
			data: {
				...data,
				schools: {
					connect: school_ids.map((id) => ({ id })),
				},
			},
			include: { schools: true },
		});
	}

	async findAll(query: Prisma.SalaryBaseFindManyArgs) {
		const results = await this.prisma.salaryBase.findMany({
			...query,
			include: { schools: true },
		});
		return results.map((r) => ({
			...r,
			school_ids: r.schools.map((s) => s.id),
		}));
	}

	async count(where: Prisma.SalaryBaseWhereInput) {
		return this.prisma.salaryBase.count({ where });
	}

	async findOne(id: number) {
		const result = await this.prisma.salaryBase.findUnique({
			where: { id },
			include: { schools: true, courseSessions: { include: { course: true } } },
		});
		if (result) {
			return {
				...result,
				school_ids: result.schools.map((s) => s.id),
			};
		}
		return result;
	}

	async update(id: number, dto: UpdateSalaryBaseDto) {
		const { school_ids, ...data } = dto;
		const updateData: Prisma.SalaryBaseUpdateInput = { ...data };
		if (school_ids !== undefined) {
			updateData.schools = {
				set: school_ids.map((id) => ({ id })),
			};
		}
		return this.prisma.salaryBase.update({
			where: { id },
			data: updateData,
			include: { schools: true },
		});
	}

	async remove(id: number) {
		return this.prisma.salaryBase.delete({ where: { id } });
	}
}
