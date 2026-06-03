import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchoolService {
	constructor(private prisma: PrismaService) {}

	async create(createSchoolDto: CreateSchoolDto, userId: number) {
		return this.prisma.school.create({
			data: { ...createSchoolDto, user_id: userId, modifier_id: userId },
		});
	}

	async findAll(query: Prisma.SchoolFindManyArgs, userId: number, isAdmin: boolean) {
		const where: Prisma.SchoolWhereInput = {
			...query.where,
			deleted_at: null,
			...(isAdmin ? {} : { user_id: userId }),
		};
		return this.prisma.school.findMany({ ...query, where });
	}

	async count(where: Prisma.SchoolWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere: Prisma.SchoolWhereInput = {
			...where,
			deleted_at: null,
			...(isAdmin ? {} : { user_id: userId }),
		};
		return this.prisma.school.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.school.findUnique({
			where: { id },
			include: {
				courses: { where: { deleted_at: null } },
			},
		});
		if (!record || record.deleted_at) throw new NotFoundException('找不到該學校');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此學校');
		}
		return record;
	}

	async update(id: number, updateSchoolDto: UpdateSchoolDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.school.findUnique({ where: { id } });
		if (!record || record.deleted_at) throw new NotFoundException('找不到該學校');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此學校');
		}
		return this.prisma.school.update({
			where: { id },
			data: { ...updateSchoolDto, modifier_id: userId },
		});
	}

	// 軟刪除：標記 deleted_at。底下的課程／學生／薪資歷史完整保留，
	// 並透過讀取時的祖先過濾（school.deleted_at）自動從列表隱藏。
	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.school.findUnique({ where: { id } });
		if (!record || record.deleted_at) throw new NotFoundException('找不到該學校');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此學校');
		}
		return this.prisma.school.update({
			where: { id },
			data: { deleted_at: new Date(), modifier_id: userId },
		});
	}
}
