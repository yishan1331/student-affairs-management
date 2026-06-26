import type { AuthProvider } from '@refinedev/core';
import { apiClient } from '../services/api';
import {
	TOKEN_KEY,
	REFRESH_TOKEN_KEY,
	SUBSYSTEM_KEY,
	SUBSYSTEM_ORDER,
	SUBSYSTEM_CONFIG,
	type Subsystem,
} from '../common/constants';

const decodeBase64Url = (base64Url: string) => {
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const decoded = atob(base64);
	const decoder = new TextDecoder('utf-8');
	const uint8Array = new Uint8Array(decoded.length);

	for (let i = 0; i < decoded.length; i++) {
		uint8Array[i] = decoded.charCodeAt(i);
	}

	return decoder.decode(uint8Array);
};

export const getTokenPayload = (token: string) => {
	const payload = decodeBase64Url(token.split('.')[1]);
	const parsedPayload = JSON.parse(payload);
	return parsedPayload;
};

const isTokenExpired = (token: string) => {
	try {
		const payload = getTokenPayload(token);
		return payload.exp < Math.floor(Date.now() / 1000);
	} catch (e) {
		return true;
	}
};

export const authProvider: AuthProvider = {
	login: async ({ username, password }) => {
		try {
			const response = await apiClient.post('/auth/login', {
				account: username,
				password,
			});
			console.log(response);
			const { access_token, refresh_token } = response.data.data;
			localStorage.setItem(TOKEN_KEY, access_token);
			if (refresh_token) {
				localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
			}

			// 依此帳號被授權的子系統決定落地頁（只有健康子系統的帳號不能落在課程頁）
			const payload = getTokenPayload(access_token);
			const allowed = SUBSYSTEM_ORDER.filter((s) =>
				((payload.subsystems ?? []) as Subsystem[]).includes(s),
			);
			const landingSubsystem = allowed[0];
			if (landingSubsystem) {
				localStorage.setItem(SUBSYSTEM_KEY, landingSubsystem);
			}
			const landingPath = landingSubsystem
				? SUBSYSTEM_CONFIG[landingSubsystem].defaultPath
				: '/';

			// 以整頁重載方式進入,確保清空前一位使用者殘留的 React Query 記憶體快取,
			// 避免換帳號登入時看到上一位使用者(如管理者)查詢過的資料。
			window.location.href = landingPath;
			return {
				success: true,
			};
		} catch (error) {
			return {
				success: false,
				error: new Error('登入失敗，請檢查帳號密碼是否正確'),
			};
		}
	},
	logout: async () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		localStorage.removeItem(SUBSYSTEM_KEY);
		// 以整頁重載方式登出,徹底清空 React Query 記憶體快取與其他應用狀態,
		// 避免下一位登入者看到上一位殘留的查詢資料。
		window.location.href = '/login';
		return {
			success: true,
		};
	},
	check: async () => {
		console.log('🚀 -> checking jwt... ');
		const token = localStorage.getItem(TOKEN_KEY);
		console.log('🚀 -> check: -> token ', !!token);
		if (token === null) {
			console.log('🚀 -> check: -> no token');
			return {
				authenticated: false,
				redirectTo: '/login',
			};
		}
		if (token && !isTokenExpired(token)) {
			return {
				authenticated: true,
			};
		}
		console.log('🚀 -> jwt expired... ');
		localStorage.setItem('auth_expired', 'true');
		return {
			authenticated: false,
			redirectTo: '/login',
		};
	},
	getPermissions: async () => null,
	getIdentity: async () => {
		const token = localStorage.getItem(TOKEN_KEY);
		if (token) {
			try {
				// const response = await apiClient.get('/user/profile');
				const payload = getTokenPayload(token);
				return {
					id: payload.sub,
					username: payload.username,
					role: payload.role,
					subsystems: payload.subsystems ?? [],
				};
			} catch (error) {
				return null;
			}
		}
		return null;
	},
	onError: async (error) => {
		console.error(error);
		return { error };
	},
};
