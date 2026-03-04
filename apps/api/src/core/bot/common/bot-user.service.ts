import { Injectable } from '@nestjs/common';
import { UserService } from '../../user/user.service';
import { AuthService } from '../../auth/auth.service';
import { BotPlatform, BotCommandResult } from './interfaces/bot-command.interface';
import { BotUserContext } from './interfaces/bot-context.interface';
import { BotMessageFormatterService } from './bot-message-formatter.service';

@Injectable()
export class BotUserService {
	constructor(
		private readonly userService: UserService,
		private readonly authService: AuthService,
		private readonly formatter: BotMessageFormatterService,
	) {}

	async resolveUser(platformId: string, platform: BotPlatform): Promise<BotUserContext> {
		const user = platform === 'telegram'
			? await this.userService.findByTelegramId(platformId)
			: await this.userService.findBySlackId(platformId);

		return {
			platformId,
			platform,
			userId: user?.id,
			username: user?.username,
		};
	}

	async bind(platformId: string, platform: BotPlatform, account: string, password: string): Promise<BotCommandResult> {
		const user = await this.authService.validateUser(account, password);
		if (!user) {
			return {
				text: this.formatter.formatError('帳號或密碼錯誤'),
				deleteUserMessage: true,
				ephemeral: true,
			};
		}

		if (user.status !== 'active') {
			return {
				text: this.formatter.formatError('此帳號已停用'),
				deleteUserMessage: true,
				ephemeral: true,
			};
		}

		// 檢查是否已被其他人綁定
		const existingBind = platform === 'telegram'
			? await this.userService.findByTelegramId(platformId)
			: await this.userService.findBySlackId(platformId);

		if (existingBind && existingBind.id !== user.id) {
			return {
				text: this.formatter.formatError('此聊天帳號已綁定其他系統帳號，請先 /unbind'),
				deleteUserMessage: true,
				ephemeral: true,
			};
		}

		try {
			if (platform === 'telegram') {
				await this.userService.bindTelegram(user.id, platformId);
			} else {
				await this.userService.bindSlack(user.id, platformId);
			}
		} catch (error) {
			if (error?.code === 'P2002') {
				return {
					text: this.formatter.formatError('此聊天帳號已被綁定'),
					deleteUserMessage: true,
					ephemeral: true,
				};
			}
			throw error;
		}

		return {
			text: this.formatter.formatBindSuccess(user.username),
			deleteUserMessage: true,
			ephemeral: true,
		};
	}

	async unbind(ctx: BotUserContext): Promise<BotCommandResult> {
		if (!ctx.userId) {
			return { text: this.formatter.formatNotBound() };
		}

		if (ctx.platform === 'telegram') {
			await this.userService.unbindTelegram(ctx.userId);
		} else {
			await this.userService.unbindSlack(ctx.userId);
		}

		return { text: this.formatter.formatUnbindSuccess() };
	}

	async getStatus(ctx: BotUserContext): Promise<BotCommandResult> {
		if (!ctx.userId) {
			return { text: this.formatter.formatNotBound() };
		}

		const user = await this.userService.findOne(ctx.userId);
		if (!user) {
			return { text: this.formatter.formatError('使用者不存在') };
		}

		return { text: this.formatter.formatStatus(user.username, user.account) };
	}
}
