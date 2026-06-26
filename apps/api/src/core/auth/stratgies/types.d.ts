export interface JwtPayload {
	sub: number; // 用戶的唯一標識符（如用戶ID）
	username: string;
	role: string;
	subsystems: string[]; // 可存取的子系統（course / health）
}
