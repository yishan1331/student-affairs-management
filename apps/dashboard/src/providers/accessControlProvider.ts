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

		// 簡單的權限檢查邏輯
		// admin可以執行所有操作
		if (role === 'admin') {
			return { can: true };
		}

		// manager可以查看和編輯，但不能刪除
		if (role === 'manager') {
			if (action === 'delete') {
				return { can: false };
			}
			return { can: true };
		}

		// staff只能查看
		if (role === 'staff') {
			if (action === 'list' || action === 'show') {
				return { can: true };
			}
			return { can: false };
		}

		// 默認拒絕所有操作
		return { can: false };
	},
};
