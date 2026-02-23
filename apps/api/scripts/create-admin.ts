import * as readline from 'readline';
import { PrismaClient, Role, Status } from '@prisma/client';
import * as dotenv from 'dotenv'; // 載入 dotenv

import { CommonUtility } from '../src/common/utility';

// 載入 .env.local 設定
dotenv.config({ path: '.env.development.local' });

const prisma = new PrismaClient();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function promptInput(question: string): Promise<string> {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer);
		});
	});
}

async function createAdmin() {
	try {
		console.log('=== 創建管理員帳號 ===');

		// 設置預設值
		let account = 'admin@example.com';
		let password = 'admin@1234';
		let username = '管理員';

		// 詢問是否使用預設值
		const useDefault = await promptInput(
			'是否使用預設值 (y/n)？預設: admin@example.com/admin@1234: ',
		);

		if (useDefault.toLowerCase() !== 'y') {
			account = await promptInput('請輸入管理員帳號 (email): ');
			password = await promptInput('請輸入管理員密碼 (最少6個字符): ');
			username = await promptInput('請輸入管理員名稱: ');
		}

		// 驗證密碼長度
		if (password.length < 6) {
			console.error('密碼長度不能少於6個字符');
			return;
		}

		// 加密密碼
		const hashedPassword = await CommonUtility.hashPassword(password);

		// 創建或更新管理員帳號
		const admin = await prisma.user.upsert({
			where: { account },
			update: {
				password: hashedPassword,
				username,
				role: Role.admin,
				status: Status.active,
			},
			create: {
				account,
				password: hashedPassword,
				username,
				role: Role.admin,
				email: account,
				status: Status.active,
			},
		});

		console.log(`管理員帳號 '${admin.username}' 創建成功!`);
	} catch (error) {
		console.error('創建管理員帳號時發生錯誤:', error);
	} finally {
		await prisma.$disconnect();
		rl.close();
	}
}

createAdmin();
