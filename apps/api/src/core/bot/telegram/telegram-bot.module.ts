import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramBotUpdate } from './telegram-bot.update';
import { BotCommonModule } from '../bot-common.module';

@Module({
	imports: [
		BotCommonModule,
		TelegrafModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				token: config.get<string>('bot.telegramToken')!,
			}),
		}),
	],
	providers: [TelegramBotUpdate],
})
export class TelegramBotModule {}
