import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PetService {
	constructor(private prisma: PrismaService) {}

	async create(userId: number, dto: CreatePetDto) {
		return this.prisma.$transaction(async (tx) => {
			const pet = await tx.pet.create({
				data: {
					...dto,
					user_id: userId,
				},
			});
			await tx.petUser.create({
				data: {
					pet_id: pet.id,
					user_id: userId,
					role: 'owner',
				},
			});
			return pet;
		});
	}

	async findAll(query: Prisma.PetFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin
			? query.where
			: { ...query.where, petUsers: { some: { user_id: userId } } };
		return this.prisma.pet.findMany({
			...query,
			where,
			include: {
				user: { select: { id: true, username: true } },
				petUsers: {
					include: { user: { select: { id: true, username: true } } },
				},
			},
		});
	}

	async count(where: Prisma.PetWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin
			? where
			: { ...where, petUsers: { some: { user_id: userId } } };
		return this.prisma.pet.count({ where: finalWhere });
	}

	async findMyPets(userId: number) {
		return this.prisma.pet.findMany({
			where: {
				is_active: true,
				petUsers: { some: { user_id: userId } },
			},
			select: { id: true, name: true, type: true },
			orderBy: { name: 'asc' },
		});
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.pet.findUnique({
			where: { id },
			include: {
				user: { select: { id: true, username: true } },
				petUsers: {
					include: { user: { select: { id: true, username: true } } },
				},
			},
		});
		if (!record) {
			throw new NotFoundException('找不到此寵物');
		}
		if (!isAdmin && !record.petUsers.some((pu) => pu.user_id === userId)) {
			throw new ForbiddenException('無權限存取此寵物');
		}
		return record;
	}

	async update(id: number, dto: UpdatePetDto, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			const petUser = await this.prisma.petUser.findUnique({
				where: { pet_id_user_id: { pet_id: id, user_id: userId } },
			});
			if (!petUser) {
				throw new ForbiddenException('無權限修改此寵物');
			}
		}
		try {
			return await this.prisma.pet.update({ where: { id }, data: dto });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此寵物');
			}
			throw error;
		}
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			const petUser = await this.prisma.petUser.findUnique({
				where: { pet_id_user_id: { pet_id: id, user_id: userId } },
			});
			if (!petUser || petUser.role !== 'owner') {
				throw new ForbiddenException('只有擁有者可以刪除寵物');
			}
		}
		try {
			return await this.prisma.pet.delete({ where: { id } });
		} catch (error) {
			if (error?.code === 'P2025') {
				throw new NotFoundException('找不到此寵物');
			}
			throw error;
		}
	}

	async exportData(userId: number, isAdmin: boolean) {
		const where = isAdmin
			? {}
			: { petUsers: { some: { user_id: userId } } };
		return this.prisma.pet.findMany({
			where,
			include: {
				user: { select: { id: true, username: true } },
				petUsers: {
					include: { user: { select: { id: true, username: true } } },
				},
			},
			orderBy: { created_at: 'desc' },
		});
	}

	// --- 共享成員管理 ---

	async getMembers(petId: number, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			const petUser = await this.prisma.petUser.findUnique({
				where: { pet_id_user_id: { pet_id: petId, user_id: userId } },
			});
			if (!petUser) {
				throw new ForbiddenException('無權限存取此寵物');
			}
		}
		return this.prisma.petUser.findMany({
			where: { pet_id: petId },
			include: { user: { select: { id: true, username: true, email: true } } },
			orderBy: { created_at: 'asc' },
		});
	}

	async addMember(petId: number, targetUserId: number, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			const petUser = await this.prisma.petUser.findUnique({
				where: { pet_id_user_id: { pet_id: petId, user_id: userId } },
			});
			if (!petUser || petUser.role !== 'owner') {
				throw new ForbiddenException('只有擁有者可以管理共享成員');
			}
		}

		// 確認目標使用者存在
		const targetUser = await this.prisma.user.findUnique({ where: { id: targetUserId } });
		if (!targetUser) {
			throw new NotFoundException('找不到此使用者');
		}

		// 確認寵物存在
		const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
		if (!pet) {
			throw new NotFoundException('找不到此寵物');
		}

		// 檢查是否已是成員
		const existing = await this.prisma.petUser.findUnique({
			where: { pet_id_user_id: { pet_id: petId, user_id: targetUserId } },
		});
		if (existing) {
			throw new ForbiddenException('此使用者已是寵物成員');
		}

		return this.prisma.petUser.create({
			data: {
				pet_id: petId,
				user_id: targetUserId,
				role: 'member',
			},
			include: { user: { select: { id: true, username: true, email: true } } },
		});
	}

	async removeMember(petId: number, targetUserId: number, userId: number, isAdmin: boolean) {
		if (!isAdmin) {
			const petUser = await this.prisma.petUser.findUnique({
				where: { pet_id_user_id: { pet_id: petId, user_id: userId } },
			});
			if (!petUser || petUser.role !== 'owner') {
				throw new ForbiddenException('只有擁有者可以管理共享成員');
			}
		}

		// 不能移除擁有者
		const targetPetUser = await this.prisma.petUser.findUnique({
			where: { pet_id_user_id: { pet_id: petId, user_id: targetUserId } },
		});
		if (!targetPetUser) {
			throw new NotFoundException('此使用者不是寵物成員');
		}
		if (targetPetUser.role === 'owner') {
			throw new ForbiddenException('不能移除擁有者');
		}

		return this.prisma.petUser.delete({
			where: { pet_id_user_id: { pet_id: petId, user_id: targetUserId } },
		});
	}

	async getAccessiblePetIds(userId: number): Promise<number[]> {
		const petUsers = await this.prisma.petUser.findMany({
			where: { user_id: userId },
			select: { pet_id: true },
		});
		return petUsers.map((pu) => pu.pet_id);
	}
}
