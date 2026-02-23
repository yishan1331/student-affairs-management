import {
	Controller, Get, Param, Query, Res, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuditLogService } from './audit-log.service';
import { Prisma } from '@prisma/client';
import { PrismaQueryBuilder } from '../../common/utils/prisma-query-builder';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('操作日誌')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/audit-log')
export class AuditLogController {
	private readonly queryBuilder: PrismaQueryBuilder;

	constructor(private readonly auditLogService: AuditLogService) {
		this.queryBuilder = new PrismaQueryBuilder({
			searchableFields: ['entity', 'action'],
			filterableFields: ['user_id', 'entity', 'action'],
			defaultSort: { id: 'desc' },
			defaultPageSize: 20,
		});
	}

	@Get()
	async findAll(@Query() query: any, @Res({ passthrough: true }) res: Response) {
		const prismaQuery = this.queryBuilder.build<Prisma.AuditLogFindManyArgs>(query);
		const where = this.queryBuilder.buildWhere(query);
		const [data, total] = await Promise.all([
			this.auditLogService.findAll(prismaQuery),
			this.auditLogService.count(where),
		]);
		res.setHeader('x-total-count', total);
		return data;
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.auditLogService.findOne(+id);
	}
}
