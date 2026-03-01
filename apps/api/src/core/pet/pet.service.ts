import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PetService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreatePetDto) {
		return this.prisma.pet.create({
			data: {
				...dto,
				user_id: userId,
			},
		});
	}

	async findAll(query: Prisma.PetFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.pet.findMany({
			...query,
			where,
			include: { user: { select: { id: true, username: true } } },
		});
	}

	async count(where: Prisma.PetWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.pet.count({ where: finalWhere });
	}

	async findMyPets(userId: number) {
		return this.prisma.pet.findMany({
			where: { user_id: userId, is_active: true },
			select: { id: true, name: true, type: true },
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.pet.findUnique({
			where: { id },
			include: { user: { select: { id: true, username: true } } },
		});
		if (!record) {
			throw new NotFoundException('找不到此寵物');
		}
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此寵物');
		}
		return record;
	}

	async update(id: number, dto: UpdatePetDto, userId: number, isAdmin: boolean) {
		const where = isAdmin ? { id } : { id, user_id: userId };
		try {
			return await this.prisma.pet.update({ where, data: dto });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此寵物或無權限修改');
			}
			throw error;
		}
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const where = isAdmin ? { id } : { id, user_id: userId };
		try {
			return await this.prisma.pet.delete({ where });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此寵物或無權限刪除');
			}
			throw error;
		}
	}

	async exportData(userId: number, isAdmin: boolean) {
		const where = isAdmin ? {} : { user_id: userId };
		return this.prisma.pet.findMany({
			where,
			include: { user: { select: { id: true, username: true } } },
			orderBy: { created_at: 'desc' },
		});
	}
}
