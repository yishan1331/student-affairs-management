export type BotPlatform = 'telegram' | 'slack';

export interface BotCommandResult {
	text: string;
	deleteUserMessage?: boolean; // Telegram: 刪除使用者訊息（用於 /bind 密碼安全）
	ephemeral?: boolean; // Slack: 用 ephemeral 回覆
}

export interface ParsedCommand {
	command: string;
	args: string[];
	raw: string;
}

export interface PetReference {
	petId: number;
	petName: string;
}
