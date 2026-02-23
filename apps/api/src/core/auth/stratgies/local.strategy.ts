import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '../auth.service';
import { JwtPayload } from './types';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly authService: AuthService) {
		super({
			usernameField: 'account',
			passwordField: 'password',
		});
	}

	async validate(account: string, password: string) {
		const user = await this.authService.validateUser(account, password);

		if (!user) {
			throw new UnauthorizedException();
		}

		const payload: JwtPayload = {
			sub: user.id,
			username: user.username,
			role: user.role!,
		};
		return payload;
	}
}
