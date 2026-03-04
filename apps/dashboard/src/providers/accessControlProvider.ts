import { AccessControlProvider, CanParams } from '@refinedev/core';

import { TOKEN_KEY } from '../common/constants';
import { getTokenPayload } from './authProvider';

// 簡化版的權限檢查，避免使用 Casbin
export const accessControlProvider: AccessControlProvider = {
	can: async (params: CanParams) => {
		const { action, resource, params: resourceParams } = params;
		const token = localStorage.getItem(TOKEN_KEY);
		if (!token) {
			return {
				can: false,
			};
		}

		const payload = getTokenPayload(token);
		const role = payload.role;

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
