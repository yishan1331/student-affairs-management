import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard, RbacGuard } from '../../common/guards';

@ApiTags('儀表板')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/dashboard')
export class DashboardController {
	constructor(private readonly dashboardService: DashboardService) {}

	@Get('statistics')
	getStatistics() {
		return this.dashboardService.getStatistics();
	}
}
