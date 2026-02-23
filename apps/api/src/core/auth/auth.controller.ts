import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { LocalAuthGuard } from '../../common/guards';

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
}
