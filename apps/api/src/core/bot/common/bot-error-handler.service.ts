import { Injectable, Logger } from '@nestjs/common';
import { BotCommandResult } from './interfaces/bot-command.interface';

@Injectable()
export class BotErrorHandlerService {
	private readonly logger = new Logger(BotErrorHandlerService.name);

	handle(error: any, command: string): BotCommandResult {
		this.logger.error(`Bot command error [${command}]: ${error?.message}`, error?.stack);

		if (error?.message?.includes('不存在') || error?.message?.includes('找不到')) {
			return { text: `❌ ${error.message}` };
		}
		if (error?.message?.includes('無權限')) {
			return { text: '❌ 您沒有權限執行此操作' };
		}
		if (error?.code === 'P2002') {
			return { text: '❌ 此帳號已被其他聊天室綁定' };
		}
		return { text: '❌ 操作失敗，請稍後再試' };
	}
}
