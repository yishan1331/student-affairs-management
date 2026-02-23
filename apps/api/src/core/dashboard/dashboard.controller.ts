import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/dashboard')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get('statistics')
	getStatistics() {
		return this.dashboardService.getStatistics();
	}
}
