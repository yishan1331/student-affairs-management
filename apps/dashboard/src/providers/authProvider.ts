import type { AuthProvider } from '@refinedev/core';
import { apiClient } from '../services/api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../common/constants';

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
			console.log(access_token);
			return {
				success: true,
				redirectTo: '/course-session',
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
		return {
			success: true,
			redirectTo: '/login',
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
