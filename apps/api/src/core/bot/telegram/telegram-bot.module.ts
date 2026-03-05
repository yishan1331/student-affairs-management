import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotUpdate } from './telegram-bot.update';
import { TelegramWebhookController } from './telegram-webhook.controller';
import { BotCommonModule } from '../bot-common.module';

const isWebhookMode = () => (process.env.BOT_MODE || 'polling') === 'webhook';

@Module({
	imports: [
		BotCommonModule,
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				token: config.get<string>('bot.telegramToken')!,
				launchOptions: isWebhookMode() ? false : undefined,
			}),
		}),
	],
	controllers: isWebhookMode() ? [TelegramWebhookController] : [],
	providers: [TelegramBotUpdate],
})
export class TelegramBotModule {}
