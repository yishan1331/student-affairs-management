import { Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard, LocalAuthGuard } from '../../common/guards';

@ApiTags('認證')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	@UseGuards(LocalAuthGuard)
	@Post('/login')
	login(@Req() request: Request) {
		return this.authService.generateJwt(request.user);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get('/me')
	me(@Req() request: Request) {
		return request.user;
	}
}
