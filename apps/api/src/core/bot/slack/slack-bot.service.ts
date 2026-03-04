import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, LogLevel } from '@slack/bolt';
import { BotCommandRouterService } from '../common/bot-command-router.service';
import { BotUserService } from '../common/bot-user.service';

@Injectable()
export class SlackBotService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(SlackBotService.name);
	private app: App;

	constructor(
		private readonly config: ConfigService,
		private readonly commandRouter: BotCommandRouterService,
		private readonly botUserService: BotUserService,
	) {}

	async onModuleInit() {
		const token = this.config.get<string>('bot.slackBotToken');
		const signingSecret = this.config.get<string>('bot.slackSigningSecret');
		const appToken = this.config.get<string>('bot.slackAppToken');

		if (!token || !signingSecret || !appToken) {
			this.logger.warn('Slack Bot 設定不完整，跳過初始化');
			return;
		}

		this.app = new App({
			token,
			signingSecret,
			appToken,
			socketMode: true,
			logLevel: LogLevel.WARN,
		});

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
}
