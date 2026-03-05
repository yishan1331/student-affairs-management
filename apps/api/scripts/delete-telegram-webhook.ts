import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.development.local' });

async function main() {
	const token = process.env.TELEGRAM_BOT_TOKEN;

	if (!token) {
		console.error('❌ 缺少 TELEGRAM_BOT_TOKEN 環境變數');
		process.exit(1);
	}

	console.log('🔗 刪除 Telegram Webhook...');

	const response = await fetch(
		`https://api.telegram.org/bot${token}/deleteWebhook`,
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ drop_pending_updates: true }),
		},
	);

	const result = await response.json();

	if (result.ok) {
		console.log('✅ Telegram Webhook 已刪除');
		console.log('   Bot 已切回 polling 模式');
	} else {
		console.error('❌ 刪除失敗:', result.description);
		process.exit(1);
	}
}

main().catch((err) => {
	console.error('❌ 發生錯誤:', err);
	process.exit(1);
});
