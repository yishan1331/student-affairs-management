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
		const where: Prisma.SalaryBaseWhereInput = {
			...query.where,
			deleted_at: null,
			...(isAdmin ? {} : { user_id: userId }),
		};
		const results = await this.prisma.salaryBase.findMany({
			...query,
			where,
			include: {
				schools: { where: { deleted_at: null } },
				courses: { where: { deleted_at: null } },
			},
		});
		return results.map((r) => ({
			...r,
			school_ids: r.schools.map((s) => s.id),
			course_ids: r.courses.map((c) => c.id),
		}));
	}

	async count(where: Prisma.SalaryBaseWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere: Prisma.SalaryBaseWhereInput = {
			...where,
			deleted_at: null,
			...(isAdmin ? {} : { user_id: userId }),
		};
		return this.prisma.salaryBase.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const result = await this.prisma.salaryBase.findUnique({
			where: { id },
			include: {
				schools: { where: { deleted_at: null } },
				courses: { where: { deleted_at: null } },
				courseSessions: { where: { deleted_at: null }, include: { course: true } },
			},
		});
		if (!result || result.deleted_at) throw new NotFoundException('找不到該薪資級距');
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
		if (!record || record.deleted_at) throw new NotFoundException('找不到該薪資級距');
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

	async removeBatch(ids: number[], userId: number, isAdmin: boolean) {
		const result = await this.prisma.salaryBase.updateMany({
			where: {
				id: { in: ids },
				deleted_at: null,
				...(isAdmin ? {} : { user_id: userId }),
			},
			data: { deleted_at: new Date(), modifier_id: userId },
		});
		return { count: result.count };
	}

	// 軟刪除：標記 deleted_at。歷史 CourseSession 已存的 salary_amount 不受影響，
	// 仍保留 salary_base_id 參照（不再被列入可選級距）。
	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.salaryBase.findUnique({ where: { id } });
		if (!record || record.deleted_at) throw new NotFoundException('找不到該薪資級距');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此薪資級距');
		}
		return this.prisma.salaryBase.update({
			where: { id },
			data: { deleted_at: new Date(), modifier_id: userId },
		});
	}
}
