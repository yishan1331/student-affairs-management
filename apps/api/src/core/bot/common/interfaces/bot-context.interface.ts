import { BotPlatform } from './bot-command.interface';

export interface BotUserContext {
	platformId: string;
	platform: BotPlatform;
	userId?: number; // 系統 User ID（已綁定時有值）
	username?: string;
}
