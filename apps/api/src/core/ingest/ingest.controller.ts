import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { ApiTokenGuard, RbacGuard } from '../../common/guards';
import { HealthWeightService } from '../health-weight/health-weight.service';
import { IngestWeightDto } from './dto/ingest-weight.dto';

@ApiTags('資料匯入（PAT）')
@ApiBearerAuth()
@UseGuards(ApiTokenGuard, RbacGuard)
@Controller('v1/ingest')
export class IngestController {
	private readonly logger = new Logger(IngestController.name);

	constructor(private readonly healthWeightService: HealthWeightService) {}

	@Post('weight')
	syncWeight(@Req() req: Request, @Body() dto: IngestWeightDto) {
		const user = req.user as any;
		// DEBUG: 印出傳入的原始 payload（驗證通過才會到這；400 的請求請看下方 logBody 的全域記錄）
		this.logger.log(
			`[ingest/weight] user=${user?.id} body=${JSON.stringify(req.body)}`,
		);
		return this.healthWeightService.upsertByDate(user.id, dto);
	}
}
