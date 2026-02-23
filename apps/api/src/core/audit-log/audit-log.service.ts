import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditLogService {
	constructor(private prisma: PrismaService) {}

	async create(data: {
		action: string;
		entity: string;
		entity_id?: number;
		user_id?: number;
		changes?: any;
		ip_address?: string;
	}) {
		return this.prisma.auditLog.create({ data });
	}

	async findAll(query: Prisma.AuditLogFindManyArgs) {
		return this.prisma.auditLog.findMany({
			...query,
			include: { user: { select: { id: true, username: true, account: true } } },
		});
	}

	async count(where: Prisma.AuditLogWhereInput) {
		return this.prisma.auditLog.count({ where });
	}

	async findOne(id: number) {
		return this.prisma.auditLog.findUnique({
			where: { id },
			include: { user: { select: { id: true, username: true, account: true } } },
		});
	}
}
