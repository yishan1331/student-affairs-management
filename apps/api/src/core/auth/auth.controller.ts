import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard, LocalAuthGuard } from '../../common/guards';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './stratgies/types';

@ApiTags('認證')
@Controller('auth')
export class AuthController {
	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
	) {}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@UseGuards(LocalAuthGuard)
	@Post('/login')
	login(@Req() request: Request) {
		return this.authService.generateJwt(request.user as JwtPayload);
	}

	@Throttle({ default: { limit: 5, ttl: 60000 } })
	@Post('/refresh')
	refresh(@Body('refresh_token') refreshToken: string) {
		return this.authService.refreshToken(refreshToken);
	}

	@Throttle({ default: { limit: 3, ttl: 60000 } })
	@Post('/forgot-password')
	forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
		return this.authService.forgotPassword(forgotPasswordDto.account);
	}

	@Throttle({ default: { limit: 3, ttl: 60000 } })
	@Post('/reset-password')
	resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
		return this.authService.resetPassword(
			resetPasswordDto.token,
			resetPasswordDto.new_password,
		);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get('/me')
	me(@Req() request: Request) {
		return request.user;
	}
}
