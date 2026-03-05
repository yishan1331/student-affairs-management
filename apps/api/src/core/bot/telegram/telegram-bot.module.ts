import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotUpdate } from './telegram-bot.update';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { BotCommonModule } from '../bot-common.module';

@Module({
	imports: [
		BotCommonModule,
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const mode = config.get<string>('bot.mode') || 'polling';
				return {
					token: config.get<string>('bot.telegramToken')!,
					launchOptions: mode === 'webhook' ? false : undefined,
				};
			},
		}),
	],
	controllers: [TelegramWebhookController],
	providers: [TelegramBotUpdate],
})
export class TelegramBotModule {}
