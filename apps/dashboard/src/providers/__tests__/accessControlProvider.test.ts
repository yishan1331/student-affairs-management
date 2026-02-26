import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { accessControlProvider } from '../accessControlProvider';

const TOKEN_KEY = 'SAMS';

// ---- Helper: build a fake JWT with the given payload ----
function buildMockJwt(payload: Record<string, unknown>): string {
	const header = { alg: 'HS256', typ: 'JWT' };
	const encode = (obj: Record<string, unknown>) => {
		const json = JSON.stringify(obj);
		const bytes = new TextEncoder().encode(json);
		let binary = '';
		bytes.forEach((b) => (binary += String.fromCharCode(b)));
		return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
	};
	const sig = 'fake_signature';
	return `${encode(header)}.${encode(payload as Record<string, unknown>)}.${sig}`;
}

function buildTokenForRole(role: string): string {
	return buildMockJwt({
		sub: '1',
		username: `${role}-user`,
		role,
		exp: Math.floor(Date.now() / 1000) + 3600,
	});
}

describe('accessControlProvider', () => {
	let localStorageStore: Record<string, string>;

	beforeEach(() => {
		localStorageStore = {};

		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
			(key: string) => localStorageStore[key] ?? null,
		);
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(
			(key: string, value: string) => {
				localStorageStore[key] = value;
			},
		);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	// ----------------------------------------------------------------
	// No token
	// ----------------------------------------------------------------
	describe('when no token is present', () => {
		it('should return can: false for any action', async () => {
			const result = await accessControlProvider.can!({
				action: 'list',
				resource: 'school',
			});

			expect(result).toEqual({ can: false });
		});
	});

	// ----------------------------------------------------------------
	// Admin role
	// ----------------------------------------------------------------
	describe('admin role', () => {
		beforeEach(() => {
			localStorageStore[TOKEN_KEY] = buildTokenForRole('admin');
		});

		it.each(['list', 'show', 'create', 'edit', 'delete'] as const)(
			'should allow "%s" action',
			async (action) => {
				const result = await accessControlProvider.can!({
					action,
					resource: 'school',
				});

				expect(result).toEqual({ can: true });
			},
		);
	});

	// ----------------------------------------------------------------
	// Manager role
	// ----------------------------------------------------------------
	describe('manager role', () => {
		beforeEach(() => {
			localStorageStore[TOKEN_KEY] = buildTokenForRole('manager');
		});

		it.each(['list', 'show', 'create', 'edit'] as const)(
			'should allow "%s" action',
			async (action) => {
				const result = await accessControlProvider.can!({
					action,
					resource: 'school',
				});

				expect(result).toEqual({ can: true });
			},
		);

		it('should deny "delete" action', async () => {
			const result = await accessControlProvider.can!({
				action: 'delete',
				resource: 'school',
			});

			expect(result).toEqual({ can: false });
		});
	});

	// ----------------------------------------------------------------
	// Staff role
	// ----------------------------------------------------------------
	describe('staff role', () => {
		beforeEach(() => {
			localStorageStore[TOKEN_KEY] = buildTokenForRole('staff');
		});

		it.each(['list', 'show'] as const)(
			'should allow "%s" action',
			async (action) => {
				const result = await accessControlProvider.can!({
					action,
					resource: 'school',
				});

				expect(result).toEqual({ can: true });
			},
		);

		it.each(['create', 'edit', 'delete'] as const)(
			'should deny "%s" action',
			async (action) => {
				const result = await accessControlProvider.can!({
					action,
					resource: 'school',
				});

				expect(result).toEqual({ can: false });
			},
		);
	});

	// ----------------------------------------------------------------
	// Unknown role
	// ----------------------------------------------------------------
	describe('unknown role', () => {
		beforeEach(() => {
			localStorageStore[TOKEN_KEY] = buildTokenForRole('unknown');
		});

		it.each(['list', 'show', 'create', 'edit', 'delete'] as const)(
			'should deny "%s" action for an unrecognized role',
			async (action) => {
				const result = await accessControlProvider.can!({
					action,
					resource: 'school',
				});

				expect(result).toEqual({ can: false });
			},
		);
	});

	// ----------------------------------------------------------------
	// Works across different resources
	// ----------------------------------------------------------------
	describe('resource-agnostic behaviour', () => {
		beforeEach(() => {
			localStorageStore[TOKEN_KEY] = buildTokenForRole('admin');
		});

		it.each(['school', 'course', 'student', 'attendance', 'grade-sheet', 'user'])(
			'admin can list resource "%s"',
			async (resource) => {
				const result = await accessControlProvider.can!({
					action: 'list',
					resource,
				});

				expect(result).toEqual({ can: true });
			},
		);
	});
});
