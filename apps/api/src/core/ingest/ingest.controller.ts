import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
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
	constructor(private readonly healthWeightService: HealthWeightService) {}

	@Post('weight')
	syncWeight(@Req() req: Request, @Body() dto: IngestWeightDto) {
		const user = req.user as any;
		return this.healthWeightService.upsertByDate(user.id, dto);
	}
}
