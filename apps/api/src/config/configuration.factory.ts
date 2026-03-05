export default () => ({
	PORT: process.env.PORT || 8000,
	bot: {
		mode: (process.env.BOT_MODE || 'polling') as 'polling' | 'webhook',
		webhookBaseUrl: process.env.BOT_WEBHOOK_BASE_URL || '',
		telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
		telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || '',
		slackBotToken: process.env.SLACK_BOT_TOKEN || '',
		slackSigningSecret: process.env.SLACK_SIGNING_SECRET || '',
		slackAppToken: process.env.SLACK_APP_TOKEN || '',
	},
});
