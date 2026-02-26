import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { authProvider, getTokenPayload } from '../authProvider';

// Mock apiClient
vi.mock('../../services/api', () => ({
	apiClient: {
		post: vi.fn(),
		get: vi.fn(),
	},
}));

import { apiClient } from '../../services/api';

// ---- Helper: build a fake JWT with the given payload ----
function buildMockJwt(payload: Record<string, unknown>): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const encode = (obj: Record<string, unknown>) => {
		const json = JSON.stringify(obj);
		// TextEncoder produces proper UTF-8 bytes for btoa
		const bytes = new TextEncoder().encode(json);
		let binary = '';
		bytes.forEach((b) => (binary += String.fromCharCode(b)));
		return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	};
	const sig = 'fake_signature';
	return `${encode(header)}.${encode(payload as Record<string, unknown>)}.${sig}`;
}

const TOKEN_KEY = 'SAMS';

describe('authProvider', () => {
	let localStorageStore: Record<string, string>;

	beforeEach(() => {
		// Provide a clean localStorage mock for every test
		localStorageStore = {};

		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
			(key: string) => localStorageStore[key] ?? null,
		);
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
			(key: string, value: string) => {
				localStorageStore[key] = value;
			},
		);
		vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(
			(key: string) => {
				delete localStorageStore[key];
			},
		);

		// Silence console.log / console.error emitted by authProvider
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ----------------------------------------------------------------
	// login
	// ----------------------------------------------------------------
	describe('login', () => {
		it('should store the access_token and return success on valid credentials', async () => {
			const fakeToken = buildMockJwt({
				sub: '1',
				username: 'admin',
				role: 'admin',
				exp: Math.floor(Date.now() / 1000) + 3600,
			});

			(apiClient.post as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
				data: {
					data: { access_token: fakeToken },
				},
			});

			const result = await authProvider.login({
				username: 'admin',
				password: 'password123',
			});

			// Verify apiClient was called correctly
			expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
				account: 'admin',
				password: 'password123',
			});

			// Token stored in localStorage
			expect(localStorageStore[TOKEN_KEY]).toBe(fakeToken);

			// Returned success with redirect
			expect(result).toEqual({
				success: true,
				redirectTo: '/',
			});
		});

		it('should return failure with error message when login fails', async () => {
			(apiClient.post as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
				new Error('Unauthorized'),
			);

			const result = await authProvider.login({
				username: 'wrong',
				password: 'wrong',
			});

			expect(result.success).toBe(false);
			expect(result.error).toBeInstanceOf(Error);
			expect(result.error?.message).toBe(
				'登入失敗，請檢查帳號密碼是否正確',
			);

			// No token should be stored
			expect(localStorageStore[TOKEN_KEY]).toBeUndefined();
		});
	});

	// ----------------------------------------------------------------
	// logout
	// ----------------------------------------------------------------
	describe('logout', () => {
		it('should remove the token from localStorage and redirect to /login', async () => {
			localStorageStore[TOKEN_KEY] = 'some-token';

			const result = await authProvider.logout({});

			expect(Storage.prototype.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
			expect(localStorageStore[TOKEN_KEY]).toBeUndefined();
			expect(result).toEqual({
				success: true,
				redirectTo: '/login',
			});
		});
	});

	// ----------------------------------------------------------------
	// check
	// ----------------------------------------------------------------
	describe('check', () => {
		it('should return authenticated: true when a valid, non-expired token exists', async () => {
			const validToken = buildMockJwt({
				sub: '1',
				username: 'admin',
				role: 'admin',
				exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
			});
			localStorageStore[TOKEN_KEY] = validToken;

			const result = await authProvider.check();

			expect(result).toEqual({ authenticated: true });
		});

		it('should return authenticated: false with redirect when no token exists', async () => {
			// localStorageStore has no TOKEN_KEY entry

			const result = await authProvider.check();

			expect(result).toEqual({
				authenticated: false,
				redirectTo: '/login',
			});
		});

		it('should return authenticated: false and set auth_expired flag when token is expired', async () => {
			const expiredToken = buildMockJwt({
				sub: '1',
				username: 'admin',
				role: 'admin',
				exp: Math.floor(Date.now() / 1000) - 60, // expired 60 seconds ago
			});
			localStorageStore[TOKEN_KEY] = expiredToken;

			const result = await authProvider.check();

			expect(result).toEqual({
				authenticated: false,
				redirectTo: '/login',
			});
			// auth_expired flag should be set
			expect(localStorageStore['auth_expired']).toBe('true');
		});
	});

	// ----------------------------------------------------------------
	// getIdentity
	// ----------------------------------------------------------------
	describe('getIdentity', () => {
		it('should return user identity decoded from the token', async () => {
			const token = buildMockJwt({
				sub: '42',
				username: 'teacher1',
				role: 'staff',
				exp: Math.floor(Date.now() / 1000) + 3600,
			});
			localStorageStore[TOKEN_KEY] = token;

			const identity = await authProvider.getIdentity!({});

			expect(identity).toEqual({
				id: '42',
				username: 'teacher1',
				role: 'staff',
			});
		});

		it('should return null when no token exists', async () => {
			const identity = await authProvider.getIdentity!({});

			expect(identity).toBeNull();
		});
	});

	// ----------------------------------------------------------------
	// getPermissions
	// ----------------------------------------------------------------
	describe('getPermissions', () => {
		it('should return null', async () => {
			const permissions = await authProvider.getPermissions!({});
			expect(permissions).toBeNull();
		});
	});

	// ----------------------------------------------------------------
	// onError
	// ----------------------------------------------------------------
	describe('onError', () => {
		it('should return the error object', async () => {
			const error = new Error('something broke');
			const result = await authProvider.onError!(error);
			expect(result).toEqual({ error });
		});
	});

	// ----------------------------------------------------------------
	// getTokenPayload (exported utility)
	// ----------------------------------------------------------------
	describe('getTokenPayload', () => {
		it('should correctly decode a JWT payload', () => {
			const payload = {
				sub: '99',
				username: 'test',
				role: 'admin',
				exp: 1700000000,
			};
			const token = buildMockJwt(payload);
			const decoded = getTokenPayload(token);

			expect(decoded).toEqual(payload);
		});
	});
});
