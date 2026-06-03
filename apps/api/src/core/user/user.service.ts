import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CommonUtility } from '../../common/utility';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async create(createUserDto: CreateUserDto) {
		const hashedPassword = await CommonUtility.hashPassword(
			createUserDto.password,
		);
		createUserDto.password = hashedPassword;
		return await this.prisma.user.create({
			data: createUserDto,
		});
	}

	async findAll(query: Prisma.UserFindManyArgs, userId: number, isAdmin: boolean) {
		// 非 admin 只能看到自己的使用者資料（用 id 過濾）
		const where: Prisma.UserWhereInput = {
			...query.where,
			deleted_at: null,
			...(isAdmin ? {} : { id: userId }),
		};
		return this.prisma.user.findMany({ ...query, where });
	}

	async count(where: Prisma.UserWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere: Prisma.UserWhereInput = {
			...where,
			deleted_at: null,
			...(isAdmin ? {} : { id: userId }),
		};
		return this.prisma.user.count({ where: finalWhere });
	}

	async searchUsers(keyword: string, limit = 10) {
		return this.prisma.user.findMany({
			where: {
				deleted_at: null,
				OR: [
					{ account: { contains: keyword, mode: 'insensitive' } },
					{ username: { contains: keyword, mode: 'insensitive' } },
				],
			},
			select: { id: true, username: true },
			take: limit,
			orderBy: { username: 'asc' },
		});
	}

	// 軟刪除的使用者一律視為不存在（登入、JWT 驗證、Bot 綁定皆查不到）
	findOne(id: number) {
		return this.prisma.user.findFirst({
			where: { id: id, deleted_at: null },
		});
	}

	findUser(account: string) {
		return this.prisma.user.findFirst({
			where: { account: account, deleted_at: null },
		});
	}

	async update(id: number, updateUserDto: UpdateUserDto) {
		if (updateUserDto.password) {
			const hashedPassword = await CommonUtility.hashPassword(
				updateUserDto.password,
			);
			updateUserDto.password = hashedPassword;
		}
		return await this.prisma.user.update({
			where: { id: id },
			data: updateUserDto,
		});
	}

	// 軟刪除：標記 deleted_at，停用帳號並保留其關聯資料（學校／課程／寵物等）
	async remove(id: number) {
		return await this.prisma.user.update({
			where: { id: id },
			data: { deleted_at: new Date() },
		});
	}

	// Bot 相關方法
	findByTelegramId(telegramId: string) {
		return this.prisma.user.findFirst({
			where: { telegram_id: telegramId, deleted_at: null },
		});
	}

	findBySlackId(slackId: string) {
		return this.prisma.user.findFirst({
			where: { slack_id: slackId, deleted_at: null },
		});
	}

	bindTelegram(userId: number, telegramId: string) {
		return this.prisma.user.update({
			where: { id: userId },
			data: { telegram_id: telegramId },
		});
	}

	unbindTelegram(userId: number) {
		return this.prisma.user.update({
			where: { id: userId },
			data: { telegram_id: null },
		});
	}

	bindSlack(userId: number, slackId: string) {
		return this.prisma.user.update({
			where: { id: userId },
			data: { slack_id: slackId },
		});
	}

	unbindSlack(userId: number) {
		return this.prisma.user.update({
			where: { id: userId },
			data: { slack_id: null },
		});
	}
}
