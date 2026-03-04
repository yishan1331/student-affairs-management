import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlackBotService } from './slack-bot.service';
import { BotCommonModule } from '../bot-common.module';

@Module({
	imports: [ConfigModule, BotCommonModule],
	providers: [SlackBotService],
})
export class SlackBotModule {}
