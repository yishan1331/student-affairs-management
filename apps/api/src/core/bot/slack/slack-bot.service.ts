import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, LogLevel } from '@slack/bolt';
import { WebClient } from '@slack/web-api';
import { BotCommandRouterService } from '../common/bot-command-router.service';
import { BotUserService } from '../common/bot-user.service';
import { BotCommandResult } from '../common/interfaces/bot-command.interface';

@Injectable()
export class SlackBotService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(SlackBotService.name);
	private app: App;
	private webClient: WebClient;
	private readonly mode: 'polling' | 'webhook';

	constructor(
		private readonly config: ConfigService,
		private readonly commandRouter: BotCommandRouterService,
		private readonly botUserService: BotUserService,
	) {
		this.mode = this.config.get<string>('bot.mode') as any || 'polling';
	}

	async onModuleInit() {
		const token = this.config.get<string>('bot.slackBotToken');
		const signingSecret = this.config.get<string>('bot.slackSigningSecret');

		if (!token || !signingSecret) {
			this.logger.warn('Slack Bot 設定不完整，跳過初始化');
			return;
		}

		// Webhook 模式：只初始化 WebClient，不啟動 Socket Mode
		if (this.mode === 'webhook') {
			this.webClient = new WebClient(token);
			this.logger.log('Slack Bot 已初始化 (Webhook 模式)');
			return;
		}

		// Polling 模式：完整 Socket Mode 啟動
		const appToken = this.config.get<string>('bot.slackAppToken');
		if (!appToken) {
			this.logger.warn('Slack Bot 缺少 SLACK_APP_TOKEN，跳過 Socket Mode 初始化');
			return;
		}

		this.app = new App({
			token,
			signingSecret,
			appToken,
			socketMode: true,
			logLevel: LogLevel.WARN,
		});

		this.webClient = this.app.client;

		// 監聽所有斜線指令開頭的訊息
		this.app.message(/^\/\w+/, async ({ message, say }) => {
			const msg = message as any;
			if (!msg.text || !msg.user) return;

			try {
				const slackId = msg.user;
				const userCtx = await this.botUserService.resolveUser(slackId, 'slack');
				const result = await this.commandRouter.route(userCtx, msg.text);

				if (result.ephemeral) {
					try {
						await this.app.client.chat.postEphemeral({
							channel: msg.channel,
							user: slackId,
							text: result.text,
						});
					} catch {
						await say(result.text);
					}
				} else {
					await say(result.text);
				}
			} catch (error) {
				this.logger.error('處理訊息時發生錯誤', error);
				await say('❌ 系統發生錯誤，請稍後再試');
			}
		});

		// 註冊 Slack slash commands
		const slashCommands = [
			'help', 'h', 'bind', 'b', 'unbind', 'ub', 'bindstatus', 'bs',
			'pets', 'ps', 'pet', 'p', 'weight', 'w', 'diet', 'd', 'toilet', 't', 'symptom', 's',
		];
		for (const cmd of slashCommands) {
			this.app.command(`/${cmd}`, async ({ command, ack, respond }) => {
				await ack();

				try {
					const slackId = command.user_id;
					const fullText = `/${cmd} ${command.text}`.trim();
					const userCtx = await this.botUserService.resolveUser(slackId, 'slack');
					const result = await this.commandRouter.route(userCtx, fullText);

					await respond({
						text: result.text,
						response_type: result.ephemeral ? 'ephemeral' : 'in_channel',
					});
				} catch (error) {
					this.logger.error(`處理 /${cmd} 指令時發生錯誤`, error);
					await respond({
						text: '❌ 系統發生錯誤，請稍後再試',
						response_type: 'ephemeral',
					});
				}
			});
		}

		await this.app.start();
		this.logger.log('Slack Bot 已啟動 (Socket Mode)');
	}

	async onModuleDestroy() {
		if (this.app) {
			await this.app.stop();
			this.logger.log('Slack Bot 已停止');
		}
	}

	/**
	 * Webhook 模式：處理 slash command
	 */
	async handleSlashCommand(command: string, text: string, userId: string): Promise<BotCommandResult> {
		const cmdName = command.startsWith('/') ? command : `/${command}`;
		const fullText = `${cmdName} ${text}`.trim();
		const userCtx = await this.botUserService.resolveUser(userId, 'slack');
		return this.commandRouter.route(userCtx, fullText);
	}

	/**
	 * Webhook 模式：處理 event callback message
	 */
	async handleMessage(text: string, userId: string, channelId: string): Promise<void> {
		if (!text.startsWith('/')) return;

		const userCtx = await this.botUserService.resolveUser(userId, 'slack');
		const result = await this.commandRouter.route(userCtx, text);

		if (this.webClient) {
			if (result.ephemeral) {
				try {
					await this.webClient.chat.postEphemeral({
						channel: channelId,
						user: userId,
						text: result.text,
					});
				} catch {
					await this.webClient.chat.postMessage({
						channel: channelId,
						text: result.text,
					});
				}
			} else {
				await this.webClient.chat.postMessage({
					channel: channelId,
					text: result.text,
				});
			}
		}
	}
}
