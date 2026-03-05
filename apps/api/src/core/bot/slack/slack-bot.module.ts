import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackBotService } from './slack-bot.service';
import { SlackWebhookController } from './slack-webhook.controller';
import { BotCommonModule } from '../bot-common.module';

const isWebhookMode = () => (process.env.BOT_MODE || 'polling') === 'webhook';

@Module({
	imports: [ConfigModule, BotCommonModule],
	controllers: isWebhookMode() ? [SlackWebhookController] : [],
	providers: [SlackBotService],
	exports: [SlackBotService],
})
export class SlackBotModule {}
