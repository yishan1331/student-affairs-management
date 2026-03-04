import { Update, Ctx, Start, Help, On } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { Logger } from '@nestjs/common';
import { BotCommandRouterService } from '../common/bot-command-router.service';
import { BotUserService } from '../common/bot-user.service';
import { BOT_HELP_TEXT } from '../common/constants/bot-commands.constant';

@Update()
export class TelegramBotUpdate {
	private readonly logger = new Logger(TelegramBotUpdate.name);

	constructor(
		private readonly commandRouter: BotCommandRouterService,
		private readonly botUserService: BotUserService,
	) {}

	@Start()
	async onStart(@Ctx() ctx: Context) {
		await ctx.reply(
			'👋 歡迎使用 Astrid 健康管理 Bot！\n\n' +
			'請先使用 /bind <帳號> <密碼> 綁定系統帳號\n' +
			'輸入 /help 查看所有指令',
		);
	}

	@Help()
	async onHelp(@Ctx() ctx: Context) {
		await ctx.reply(BOT_HELP_TEXT);
	}

	@On('text')
	async onText(@Ctx() ctx: Context) {
		const message = ctx.message as any;
		if (!message?.text?.startsWith('/')) return;

		try {
			const telegramId = String(message.from.id);

			const userCtx = await this.botUserService.resolveUser(telegramId, 'telegram');
			const result = await this.commandRouter.route(userCtx, message.text);

			// 安全處理：刪除含密碼的訊息
			if (result.deleteUserMessage) {
				try {
					await ctx.deleteMessage(message.message_id);
				} catch (error) {
					this.logger.warn('無法刪除訊息（可能在群組中缺少權限）');
				}
			}

			await ctx.reply(result.text);
		} catch (error) {
			this.logger.error('處理指令時發生錯誤', error);
			await ctx.reply('❌ 系統發生錯誤，請稍後再試');
		}
	}
}
