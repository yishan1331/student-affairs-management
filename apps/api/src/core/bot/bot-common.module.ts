import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PetModule } from '../pet/pet.module';
import { HealthWeightModule } from '../health-weight/health-weight.module';
import { HealthDietModule } from '../health-diet/health-diet.module';
import { HealthToiletModule } from '../health-toilet/health-toilet.module';
import { HealthSymptomModule } from '../health-symptom/health-symptom.module';
import { BotCommandRouterService } from './common/bot-command-router.service';
import { BotUserService } from './common/bot-user.service';
import { BotMessageFormatterService } from './common/bot-message-formatter.service';
import { BotErrorHandlerService } from './common/bot-error-handler.service';

@Module({
	imports: [
		ConfigModule,
		UserModule,
		AuthModule,
		PetModule,
		HealthWeightModule,
		HealthDietModule,
		HealthToiletModule,
		HealthSymptomModule,
	],
	providers: [
		BotCommandRouterService,
		BotUserService,
		BotMessageFormatterService,
		BotErrorHandlerService,
	],
	exports: [
		BotCommandRouterService,
		BotUserService,
		BotMessageFormatterService,
		BotErrorHandlerService,
	],
})
export class BotCommonModule {}
