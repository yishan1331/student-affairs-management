import { argon2id, hash, verify } from 'argon2';

export class CommonUtility {
	static async hashPassword(pwd: string): Promise<string> {
		return hash(pwd, {
			type: argon2id,
			memoryCost: 2 ** 16,
			timeCost: 3,
			parallelism: 1,
		});
	}

	static async verifyPassword(
		hashedPassword: string,
		plainPassword: string,
	): Promise<boolean> {
		try {
			return await verify(hashedPassword, plainPassword);
		} catch (err) {
			console.error('驗證密碼時發生錯誤', err);
			return false;
		}
	}
}
