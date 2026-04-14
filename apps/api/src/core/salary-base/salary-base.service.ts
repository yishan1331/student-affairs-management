import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSalaryBaseDto } from './dto/create-salary-base.dto';
import { UpdateSalaryBaseDto } from './dto/update-salary-base.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SalaryBaseService {
	constructor(private prisma: PrismaService) {}

	async create(dto: CreateSalaryBaseDto, userId: number) {
		const { name, hourly_rate, min_students, max_students, description, is_active, school_ids, course_ids } = dto;
		return this.prisma.salaryBase.create({
			data: {
				name,
				hourly_rate,
				min_students,
				max_students,
				description,
				is_active,
				user_id: userId,
				schools: {
					connect: school_ids.map((id) => ({ id })),
				},
				...(course_ids && course_ids.length > 0
					? { courses: { connect: course_ids.map((id) => ({ id })) } }
					: {}),
			},
			include: { schools: true, courses: true },
		});
	}

	async findAll(query: Prisma.SalaryBaseFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		const results = await this.prisma.salaryBase.findMany({
			...query,
			where,
			include: { schools: true, courses: true },
		});
		return results.map((r) => ({
			...r,
			school_ids: r.schools.map((s) => s.id),
			course_ids: r.courses.map((c) => c.id),
		}));
	}

	async count(where: Prisma.SalaryBaseWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.salaryBase.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const result = await this.prisma.salaryBase.findUnique({
			where: { id },
			include: { schools: true, courses: true, courseSessions: { include: { course: true } } },
		});
		if (!result) throw new NotFoundException('找不到該薪資級距');
		if (!isAdmin && result.user_id !== userId) {
			throw new ForbiddenException('無權限存取此薪資級距');
		}
		return {
			...result,
			school_ids: result.schools.map((s) => s.id),
			course_ids: result.courses.map((c) => c.id),
		};
	}

	async update(id: number, dto: UpdateSalaryBaseDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.salaryBase.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該薪資級距');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此薪資級距');
		}
		const { name, hourly_rate, min_students, max_students, description, is_active, school_ids, course_ids } = dto;
		const updateData: Prisma.SalaryBaseUpdateInput = {
			modifier: { connect: { id: userId } },
		};
		if (name !== undefined) updateData.name = name;
		if (hourly_rate !== undefined) updateData.hourly_rate = hourly_rate;
		if (min_students !== undefined) updateData.min_students = min_students;
		if (max_students !== undefined) updateData.max_students = max_students;
		if (description !== undefined) updateData.description = description;
		if (is_active !== undefined) updateData.is_active = is_active;
		if (school_ids !== undefined) {
			updateData.schools = {
				set: school_ids.map((id) => ({ id })),
			};
		}
		if (course_ids !== undefined) {
			updateData.courses = {
				set: course_ids.map((id) => ({ id })),
			};
		}
		return this.prisma.salaryBase.update({
			where: { id },
			data: updateData,
			include: { schools: true, courses: true },
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
