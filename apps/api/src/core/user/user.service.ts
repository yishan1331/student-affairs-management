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
		const where = isAdmin ? query.where : { ...query.where, id: userId };
		return this.prisma.user.findMany({ ...query, where });
	}

	async count(where: Prisma.UserWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, id: userId };
		return this.prisma.user.count({ where: finalWhere });
	}

	findOne(id: number) {
		return this.prisma.user.findFirst({
			where: { id: id },
		});
	}

	findUser(account: string) {
		return this.prisma.user.findUnique({
			where: { account: account },
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

	async remove(id: number) {
		return await this.prisma.user.delete({
			where: { id: id },
		});
	}

	// Bot 相關方法
	findByTelegramId(telegramId: string) {
		return this.prisma.user.findUnique({
			where: { telegram_id: telegramId },
		});
	}

	findBySlackId(slackId: string) {
		return this.prisma.user.findUnique({
			where: { slack_id: slackId },
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
