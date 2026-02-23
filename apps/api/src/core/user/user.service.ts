import { Injectable } from '@nestjs/common';

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

	findAll() {
		return this.prisma.user.findMany();
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
}
