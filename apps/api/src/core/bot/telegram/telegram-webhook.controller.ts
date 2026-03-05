import { Controller, Post, Req, Res, Logger, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@ApiExcludeController()
@SkipThrottle()
@Controller('bot/telegram')
export class TelegramWebhookController {
	private readonly logger = new Logger(TelegramWebhookController.name);
	private readonly webhookSecret: string;

	constructor(
		@InjectBot() private readonly bot: Telegraf,
		private readonly config: ConfigService,
	) {
		this.webhookSecret = this.config.get<string>('bot.telegramWebhookSecret') || '';
	}

	@Post('webhook')
	async handleWebhook(@Req() req: Request, @Res() res: Response) {
		if (this.webhookSecret) {
			const headerSecret = req.headers['x-telegram-bot-api-secret-token'];
			if (headerSecret !== this.webhookSecret) {
				this.logger.warn('Telegram webhook 驗證失敗：secret token 不符');
				res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' });
				return;
			}
		}

		try {
			await this.bot.handleUpdate(req.body);
		} catch (error) {
			this.logger.error('處理 Telegram webhook 時發生錯誤', error);
		}

		res.status(HttpStatus.OK).json({ ok: true });
	}
}
