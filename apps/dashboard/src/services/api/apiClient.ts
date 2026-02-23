import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { TOKEN_KEY, BASE_URL } from '../../common/constants';
import { showMessage } from '../../utils/message';

// 錯誤類型定義
interface ApiError {
	statusCode: number;
	success: boolean;
	timestamp: string;
	message: string;
}

// 創建axios實例
const apiClient = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// 請求重試配置
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// 請求攔截器
apiClient.interceptors.request.use(
	(config) => {
		// 從localStorage獲取token並添加到請求頭
		const token = localStorage.getItem(TOKEN_KEY);
		if (token && config.headers) {
			// 確保所有請求都帶上 Bearer Token
			config.headers.Authorization = `Bearer ${token}`;
		} else {
			// 如果沒有 token，檢查是否為登錄請求
			const isLoginRequest = config.url?.includes('/auth/login');
			if (!isLoginRequest) {
				// 如果不是登錄請求且沒有 token，重定向到登錄頁
				window.location.href = '/login';
				return Promise.reject('未登錄或登錄已過期');
			}
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// 響應攔截器
apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error: AxiosError<ApiError>) => {
		const config = error.config as AxiosRequestConfig & { _retry?: number };
		console.log(config);

		// // 處理請求重試
		// if (config && !config._retry) {
		// 	config._retry = 0;
		// }

		// if (config && config._retry && config._retry < MAX_RETRIES) {
		// 	config._retry += 1;
		// 	await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
		// 	return apiClient(config);
		// }

		// 處理錯誤響應
		if (error.response) {
			const { status, data } = error.response;
			console.log(status, data);

			// 處理401錯誤（未授權）
			if (status === 401) {
				// 檢查當前頁面路徑
				const currentPath = window.location.pathname;
				if (currentPath !== '/login') {
					localStorage.setItem('auth_expired', 'true');
					localStorage.removeItem(TOKEN_KEY);
					window.location.href = '/login';
				}
			} else if (status === 403) {
				// 處理403錯誤（禁止訪問）
				showMessage.error('您沒有權限執行此操作');
			} else if (status === 404) {
				// 處理404錯誤（資源不存在）
				showMessage.error('請求的資源不存在');
			} else if (status === 405) {
				// 處理405錯誤（方法不允許）
				showMessage.error('請求的方法不允許');
			} else if (status >= 500) {
				// 處理500錯誤（服務器錯誤）
				showMessage.error('服務器發生錯誤，請稍後再試');
			} else {
				// 處理其他錯誤
				const errorMessage = data?.message || '發生未知錯誤';
				showMessage.error(errorMessage);
			}
		} else if (error.request) {
			// 請求已發出但沒有收到響應
			console.log('🚀 -> request ', error.request);
			showMessage.error('無法連接到服務器，請檢查網絡連接');
		} else {
			// 請求配置出錯
			showMessage.error('請求配置錯誤');
		}

		return Promise.reject(error);
	},
);

// 通用請求方法
export const request = async <T = any>(
	config: AxiosRequestConfig,
): Promise<T> => {
	try {
		const response: AxiosResponse<T> = await apiClient(config);
		return response.data;
	} catch (error) {
		return Promise.reject(error);
	}
};

// 請求取消功能
export const createCancelToken = () => {
	const source = axios.CancelToken.source();
	return {
		token: source.token,
		cancel: source.cancel,
	};
};

export default apiClient;
