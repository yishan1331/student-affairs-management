import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseIntPipe,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard, RbacGuard } from '../../common/guards';
import { ApiTokenService } from './api-token.service';
import { CreateApiTokenDto } from './dto/create-api-token.dto';

@ApiTags('個人存取權杖')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('v1/api-token')
export class ApiTokenController {
	constructor(private readonly apiTokenService: ApiTokenService) {}

	@Post()
	create(@Req() req: Request, @Body() dto: CreateApiTokenDto) {
		const user = req.user as any;
		return this.apiTokenService.create(user.id, dto);
	}

	@Get()
	findAll(@Req() req: Request) {
		const user = req.user as any;
		return this.apiTokenService.findAll(user.id);
	}

	@Delete(':id')
	revoke(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
		const user = req.user as any;
		return this.apiTokenService.revoke(user.id, id);
	}
}
