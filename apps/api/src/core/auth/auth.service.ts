import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { CommonUtility } from '../../common/utility';
import { JwtPayload } from './stratgies/types';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class AuthService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
	) {}

	async validateUser(account: string, password: string) {
		const user = await this.userService.findUser(account);
		if (!user || !user.password) {
			return null;
		}
		const isValid = await CommonUtility.verifyPassword(
			user.password,
			password,
		);
		if (!isValid) {
			return null;
		}
		return user;
	}

	generateJwt(payload: JwtPayload) {
		const accessPayload = {
			sub: payload.sub,
			username: payload.username,
			role: payload.role,
		};
		const refreshPayload = { sub: payload.sub, type: 'refresh' };
		return {
			access_token: this.jwtService.sign(accessPayload, {
				expiresIn: '1h',
			}),
			refresh_token: this.jwtService.sign(refreshPayload, {
				expiresIn: '7d',
			}),
		};
	}

	async refreshToken(refreshToken: string) {
		try {
			const payload = this.jwtService.verify(refreshToken);
			if (payload.type !== 'refresh') {
				throw new UnauthorizedException('Invalid token type');
			}
			const user = await this.userService.findOne(payload.sub);
			if (!user) {
				throw new UnauthorizedException('User not found');
			}
			const jwtPayload: JwtPayload = {
				sub: user.id,
				username: user.username,
				role: user.role!,
			};
			return this.generateJwt(jwtPayload);
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}
			throw new UnauthorizedException('Invalid refresh token');
		}
	}

	async forgotPassword(account: string) {
		const user = await this.userService.findUser(account);
		if (!user) {
			// 不洩露使用者是否存在，統一回傳成功
			return { message: '如果帳號存在，重設連結已發送' };
		}
		const resetToken = this.jwtService.sign(
			{ sub: user.id, type: 'reset' },
			{ expiresIn: '15m' },
		);
		// TODO: 實際環境應寄送 email，這裡直接回傳 token
		return { message: '如果帳號存在，重設連結已發送', reset_token: resetToken };
	}

	async resetPassword(token: string, newPassword: string) {
		try {
			const payload = this.jwtService.verify(token);
			if (payload.type !== 'reset') {
				throw new UnauthorizedException('Invalid token type');
			}
			await this.userService.update(payload.sub, {
				password: newPassword,
			});
			return { message: '密碼重設成功' };
		} catch (error) {
			if (error instanceof UnauthorizedException) {
				throw error;
			}
			throw new UnauthorizedException('重設連結已過期或無效');
		}
	}

	async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
		const updateData: any = {};
		if (updateProfileDto.username) {
			updateData.username = updateProfileDto.username;
		}
		if (updateProfileDto.email) {
			updateData.email = updateProfileDto.email;
		}
		if (updateProfileDto.password) {
			updateData.password = updateProfileDto.password;
		}
		return this.userService.update(userId, updateData);
	}
}
