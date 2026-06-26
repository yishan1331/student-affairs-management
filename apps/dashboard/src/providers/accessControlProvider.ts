import { AccessControlProvider, CanParams } from '@refinedev/core';

import { TOKEN_KEY, RESOURCE_SUBSYSTEM, type Subsystem } from '../common/constants';
import { getTokenPayload } from './authProvider';

// 簡化版的權限檢查，避免使用 Casbin
export const accessControlProvider: AccessControlProvider = {
	can: async (params: CanParams) => {
		const { action, resource } = params;
		const token = localStorage.getItem(TOKEN_KEY);
		if (!token) {
			return {
				can: false,
			};
		}

		const payload = getTokenPayload(token);
		const role = payload.role;
		const subsystems = (payload.subsystems ?? []) as Subsystem[];

		// ── 子系統把關（與角色無關）──
		// 資源若歸屬某子系統，帳號必須擁有該子系統才可存取；共用資源不受限。
		if (resource) {
			const resourceSub = RESOURCE_SUBSYSTEM[resource];
			if (resourceSub && !subsystems.includes(resourceSub)) {
				return { can: false, reason: '此帳號無權存取該子系統' };
			}
		}

		// ── 角色把關 ──
		// admin 可以執行所有操作
		if (role === 'admin') {
			return { can: true };
		}

		// user 除了 User 模組外，擁有完整 CRUD 權限
		if (role === 'user') {
			if (resource === 'user') {
				return { can: false };
			}
			return { can: true };
		}

		// guest 除了 User 模組外，只能讀取
		if (role === 'guest') {
			if (resource === 'user') {
				return { can: false };
			}
			if (action === 'list' || action === 'show') {
				return { can: true };
			}
			return { can: false };
		}

		// 默認拒絕所有操作
		return { can: false };
	},
};
