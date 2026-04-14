import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { createHash } from 'crypto';

import { PrismaService } from '../../../prisma/prisma.service';

export const API_TOKEN_PREFIX = 'pat_';

export function hashApiToken(raw: string): string {
	return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class ApiTokenGuard implements CanActivate {
	constructor(private readonly prisma: PrismaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<Request>();
		const header = req.headers['authorization'] || req.headers['Authorization' as any];
		if (!header || typeof header !== 'string' || !header.startsWith('Bearer ')) {
			throw new UnauthorizedException('缺少有效的存取權杖');
		}
		const raw = header.slice('Bearer '.length).trim();
		if (!raw.startsWith(API_TOKEN_PREFIX)) {
			throw new UnauthorizedException('存取權杖格式錯誤');
		}

		const token = await this.prisma.apiToken.findUnique({
			where: { token_hash: hashApiToken(raw) },
			include: {
				user: {
					select: {
						id: true,
						username: true,
						account: true,
						role: true,
						status: true,
					},
				},
			},
		});

		if (!token || token.revoked_at) {
			throw new UnauthorizedException('存取權杖無效或已撤銷');
		}
		if (token.expires_at && token.expires_at < new Date()) {
			throw new UnauthorizedException('存取權杖已過期');
		}
		if (!token.user || token.user.status !== 'active') {
			throw new UnauthorizedException('使用者不存在或已停用');
		}

		(req as any).user = token.user;
		(req as any).apiToken = { id: token.id, name: token.name };

		this.prisma.apiToken
			.update({ where: { id: token.id }, data: { last_used_at: new Date() } })
			.catch(() => undefined);

		return true;
	}
}
