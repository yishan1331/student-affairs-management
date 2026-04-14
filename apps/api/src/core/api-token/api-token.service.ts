import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';

import { PrismaService } from '../../prisma/prisma.service';
import { API_TOKEN_PREFIX, hashApiToken } from '../../common/guards';
import { CreateApiTokenDto } from './dto/create-api-token.dto';

@Injectable()
export class ApiTokenService {
	constructor(private readonly prisma: PrismaService) {}

	async create(userId: number, dto: CreateApiTokenDto) {
		const raw = API_TOKEN_PREFIX + randomBytes(32).toString('base64url');
		const expires_at = dto.expires_in_days
			? new Date(Date.now() + dto.expires_in_days * 24 * 60 * 60 * 1000)
			: null;

		const record = await this.prisma.apiToken.create({
			data: {
				user_id: userId,
				name: dto.name,
				token_hash: hashApiToken(raw),
				expires_at,
			},
			select: {
				id: true,
				name: true,
				expires_at: true,
				created_at: true,
			},
		});

		return { ...record, token: raw };
	}

	findAll(userId: number, role?: string) {
		const isAdmin = role === 'admin';
		return this.prisma.apiToken.findMany({
			where: isAdmin ? {} : { user_id: userId },
			select: {
				id: true,
				name: true,
				last_used_at: true,
				expires_at: true,
				revoked_at: true,
				created_at: true,
				user_id: true,
				user: {
					select: { id: true, account: true, username: true, role: true },
				},
			},
			orderBy: { created_at: 'desc' },
		});
	}

	async revoke(userId: number, id: number, role?: string) {
		const isAdmin = role === 'admin';
		const token = await this.prisma.apiToken.findFirst({
			where: isAdmin ? { id } : { id, user_id: userId },
		});
		if (!token) {
			throw new NotFoundException('找不到此權杖');
		}
		if (token.revoked_at) {
			return token;
		}
		return this.prisma.apiToken.update({
			where: { id },
			data: { revoked_at: new Date() },
		});
	}
}
