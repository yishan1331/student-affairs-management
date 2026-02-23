import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { CommonUtility } from '../../common/utility';

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

	generateJwt(payload) {
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}
