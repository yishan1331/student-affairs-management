import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackBotService } from './slack-bot.service';
import { SlackWebhookController } from './slack-webhook.controller';
import { BotCommonModule } from '../bot-common.module';

@Module({
	imports: [ConfigModule, BotCommonModule],
	controllers: [SlackWebhookController],
	providers: [SlackBotService],
	exports: [SlackBotService],
})
export class SlackBotModule {}
