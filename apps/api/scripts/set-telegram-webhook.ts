import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

async function main() {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const baseUrl = process.env.BOT_WEBHOOK_BASE_URL;
	const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

	if (!token) {
		console.error('❌ 缺少 TELEGRAM_BOT_TOKEN 環境變數');
		process.exit(1);
	}

	if (!baseUrl) {
		console.error('❌ 缺少 BOT_WEBHOOK_BASE_URL 環境變數');
		process.exit(1);
	}

	const webhookUrl = `${baseUrl}/api/bot/telegram/webhook`;

	const params: Record<string, string> = { url: webhookUrl };
	if (secret) {
		params.secret_token = secret;
	}

	console.log(`🔗 設定 Telegram Webhook: ${webhookUrl}`);

	const response = await fetch(
		`https://api.telegram.org/bot${token}/setWebhook`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(params),
		},
	);

	const result = await response.json();

	if (result.ok) {
		console.log('✅ Telegram Webhook 設定成功');
		console.log(`   URL: ${webhookUrl}`);
		if (secret) console.log('   Secret Token: 已設定');
	} else {
		console.error('❌ 設定失敗:', result.description);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('❌ 發生錯誤:', err);
	process.exit(1);
});
