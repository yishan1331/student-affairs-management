import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JwtPayload } from './types';
import { UserService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		configService: ConfigService,
		private readonly userService: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('secrets.jwt')!,
		});
	}

	async validate(payload: JwtPayload) {
		const user = await this.userService.findOne(payload.sub);
		if (!user) {
			return null;
		}
		return {
			id: user.id,
			username: user.username,
			account: user.account,
			role: user.role,
			status: user.status,
		};
	}
}
