import { Module, Logger } from '@nestjs/common';
import { BotCommonModule } from './bot-common.module';
import { TelegramBotModule } from './telegram/telegram-bot.module';
import { SlackBotModule } from './slack/slack-bot.module';

@Module({})
export class BotModule {
	private static readonly logger = new Logger(BotModule.name);

	static register() {
		return {
			module: BotModule,
			imports: [
				BotCommonModule,
				...(process.env.TELEGRAM_BOT_TOKEN ? [TelegramBotModule] : []),
				...(process.env.SLACK_BOT_TOKEN ? [SlackBotModule] : []),
			],
		};
	}
}
