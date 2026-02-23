import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { LocalStrategy } from './stratgies/local.strategy';
import { JwtStrategy } from './stratgies/jwt.strategy';

@Module({
	imports: [
		PassportModule,
		UserModule,
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const secret =
					config.get('secrets.jwt') || 'default-secret-key';
				return {
					secret,
					signOptions: {
						expiresIn: '1h',
					},
				};
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
