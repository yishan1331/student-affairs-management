import { Controller, Post, Req, Res, Logger, HttpStatus, RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { SlackBotService } from './slack-bot.service';

@ApiExcludeController()
@SkipThrottle()
@Controller('bot/slack')
export class SlackWebhookController {
	private readonly logger = new Logger(SlackWebhookController.name);
	private readonly signingSecret: string;

	constructor(
		private readonly slackBotService: SlackBotService,
		private readonly config: ConfigService,
	) {
		this.signingSecret = this.config.get<string>('bot.slackSigningSecret') || '';
	}

	@Post('events')
	async handleEvents(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
		const body = req.body;

		// url_verification challenge 優先處理（Slack 設定 URL 時的驗證）
		// 放在簽章驗證之前，因為 Vercel serverless 環境 rawBody 可能不可用
		if (body?.type === 'url_verification') {
			this.logger.log('收到 Slack url_verification challenge');
			return res.status(HttpStatus.OK).json({ challenge: body.challenge });
		}

		// 驗證 Slack 簽章
		if (!this.verifySlackSignature(req)) {
			this.logger.warn('Slack webhook 驗證失敗：簽章不符');
			return res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' });
		}

		// Slash command（application/x-www-form-urlencoded，body.command 存在）
		if (body.command) {
			try {
				const result = await this.slackBotService.handleSlashCommand(
					body.command,
					body.text || '',
					body.user_id,
				);
				return res.status(HttpStatus.OK).json({
					response_type: result.ephemeral ? 'ephemeral' : 'in_channel',
					text: result.text,
				});
			} catch (error) {
				this.logger.error('處理 Slack slash command 時發生錯誤', error);
				return res.status(HttpStatus.OK).json({
					response_type: 'ephemeral',
					text: '❌ 系統發生錯誤，請稍後再試',
				});
			}
		}

		// Event callback
		if (body.type === 'event_callback') {
			// 立即回覆 200，避免 Slack 重試
			res.status(HttpStatus.OK).json({ ok: true });

			try {
				const event = body.event;
				if (event?.type === 'message' && !event.bot_id && event.text) {
					await this.slackBotService.handleMessage(
						event.text,
						event.user,
						event.channel,
					);
				}
			} catch (error) {
				this.logger.error('處理 Slack event callback 時發生錯誤', error);
			}
			return;
		}

		return res.status(HttpStatus.OK).json({ ok: true });
	}

	private verifySlackSignature(req: RawBodyRequest<Request>): boolean {
		if (!this.signingSecret) return true;

		const timestamp = req.headers['x-slack-request-timestamp'] as string;
		const slackSignature = req.headers['x-slack-signature'] as string;

		if (!timestamp || !slackSignature) return false;

		// 防重放攻擊：時間戳超過 5 分鐘拒絕
		const now = Math.floor(Date.now() / 1000);
		if (Math.abs(now - parseInt(timestamp)) > 300) return false;

		// 取得 raw body
		const rawBody = req.rawBody;
		if (!rawBody) {
			this.logger.warn('rawBody 不可用，跳過簽章驗證');
			return true;
		}

		const sigBaseString = `v0:${timestamp}:${rawBody.toString()}`;
		const mySignature = 'v0=' + crypto.createHmac('sha256', this.signingSecret).update(sigBaseString).digest('hex');

		try {
			return crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(slackSignature));
		} catch {
			return false;
		}
	}
}
