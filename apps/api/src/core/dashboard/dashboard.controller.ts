import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('儀表板')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/dashboard')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get('statistics')
	getStatistics(@Req() req: Request) {
		const user = req.user as any;
		const isAdmin = user.role === 'admin';
		return this.dashboardService.getStatistics(user.id, isAdmin);
	}
}
