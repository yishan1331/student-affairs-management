export default () => ({
	PORT: process.env.PORT || 8000,
	bot: {
		telegramToken: process.env.TELEGRAM_BOT_TOKEN || '',
		slackBotToken: process.env.SLACK_BOT_TOKEN || '',
		slackSigningSecret: process.env.SLACK_SIGNING_SECRET || '',
		slackAppToken: process.env.SLACK_APP_TOKEN || '',
	},
});
