import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

	async findAll(query: Prisma.SchoolFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.school.findMany({ ...query, where });
	}

	async count(where: Prisma.SchoolWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.school.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.school.findUnique({
			where: { id },
			include: {
				courses: true,
			},
		});
		if (!record) throw new NotFoundException('找不到該學校');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此學校');
		}
		return record;
	}

	async update(id: number, updateSchoolDto: UpdateSchoolDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.school.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該學校');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此學校');
		}
		return this.prisma.school.update({
			where: { id },
			data: updateSchoolDto,
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.school.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該學校');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此學校');
		}
		return this.prisma.school.delete({
			where: { id },
		});
	}
}
