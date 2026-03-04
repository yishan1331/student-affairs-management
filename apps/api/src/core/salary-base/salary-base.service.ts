import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalaryBaseDto } from './dto/create-salary-base.dto';
import { UpdateSalaryBaseDto } from './dto/update-salary-base.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalaryBaseService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateSalaryBaseDto, userId: number) {
		const { school_ids, ...data } = dto;
		return this.prisma.salaryBase.create({
			data: {
				...data,
				user_id: userId,
				schools: {
					connect: school_ids.map((id) => ({ id })),
				},
			},
			include: { schools: true },
		});
	}

	async findAll(query: Prisma.SalaryBaseFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		const results = await this.prisma.salaryBase.findMany({
			...query,
			where,
			include: { schools: true },
		});
		return results.map((r) => ({
			...r,
			school_ids: r.schools.map((s) => s.id),
		}));
	}

	async count(where: Prisma.SalaryBaseWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.salaryBase.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const result = await this.prisma.salaryBase.findUnique({
			where: { id },
			include: { schools: true, courseSessions: { include: { course: true } } },
		});
		if (!result) throw new NotFoundException('找不到該薪資級距');
		if (!isAdmin && result.user_id !== userId) {
			throw new ForbiddenException('無權限存取此薪資級距');
		}
		return {
			...result,
			school_ids: result.schools.map((s) => s.id),
		};
	}

	async update(id: number, dto: UpdateSalaryBaseDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.salaryBase.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該薪資級距');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此薪資級距');
		}
		const { school_ids, ...data } = dto;
		const updateData: Prisma.SalaryBaseUpdateInput = {
			...data,
			modifier: { connect: { id: userId } },
		};
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

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.salaryBase.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該薪資級距');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此薪資級距');
		}
		return this.prisma.salaryBase.delete({ where: { id } });
	}
}
