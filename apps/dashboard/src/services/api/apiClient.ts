import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, BASE_URL } from '../../common/constants';
import { showMessage } from '../../utils/message';

// 錯誤類型定義
interface ApiError {
	statusCode: number;
	success: boolean;
	timestamp: string;
	message: string;
}

// Refresh token 並發控制
let isRefreshing = false;
let failedQueue: Array<{
	resolve: (token: string) => void;
	reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (token) {
			resolve(token);
		} else {
			reject(error);
		}
	});
	failedQueue = [];
};

const clearTokensAndRedirect = () => {
	localStorage.setItem('auth_expired', 'true');
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
	window.location.href = '/login';
};

// 創建axios實例
const apiClient = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// 請求攔截器
apiClient.interceptors.request.use(
	(config) => {
		// 從localStorage獲取token並添加到請求頭
		const token = localStorage.getItem(TOKEN_KEY);
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		} else {
			// 如果沒有 token，檢查是否為不需要認證的請求
			const isAuthRequest = config.url?.includes('/auth/');
			if (!isAuthRequest) {
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
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		// 處理錯誤響應
		if (error.response) {
			const { status, data } = error.response;

			// 處理401錯誤（未授權）— 嘗試 refresh token
			if (status === 401 && originalRequest && !originalRequest._retry) {
				// 如果是 refresh 請求本身失敗，直接登出
				if (originalRequest.url?.includes('/auth/refresh')) {
					clearTokensAndRedirect();
					return Promise.reject(error);
				}

				// 如果正在 refreshing，排隊等待
				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({
							resolve: (token: string) => {
								originalRequest.headers.Authorization = `Bearer ${token}`;
								resolve(apiClient(originalRequest));
							},
							reject: (err: any) => {
								reject(err);
							},
						});
					});
				}

				originalRequest._retry = true;
				isRefreshing = true;

				const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

				if (!refreshToken) {
					isRefreshing = false;
					processQueue(error, null);
					clearTokensAndRedirect();
					return Promise.reject(error);
				}

				try {
					const response = await axios.post(
						`${BASE_URL}/auth/refresh`,
						{ refresh_token: refreshToken },
						{ headers: { 'Content-Type': 'application/json' } },
					);

					const { access_token, refresh_token: newRefreshToken } = response.data.data;

					localStorage.setItem(TOKEN_KEY, access_token);
					if (newRefreshToken) {
						localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
					}

					// 通知排隊中的請求使用新 token
					processQueue(null, access_token);

					// 重送原始請求
					originalRequest.headers.Authorization = `Bearer ${access_token}`;
					return apiClient(originalRequest);
				} catch (refreshError) {
					processQueue(refreshError, null);
					clearTokensAndRedirect();
					return Promise.reject(refreshError);
				} finally {
					isRefreshing = false;
				}
			}

			// 處理其他錯誤（不再處理 401，上面已處理）
			if (status === 401) {
				// _retry 為 true 代表已嘗試 refresh 但仍 401
				clearTokensAndRedirect();
			} else if (status === 403) {
				showMessage.error('您沒有權限執行此操作');
			} else if (status === 404) {
				showMessage.error('請求的資源不存在');
			} else if (status === 405) {
				showMessage.error('請求的方法不允許');
			} else if (status >= 500) {
				showMessage.error('服務器發生錯誤，請稍後再試');
			} else {
				const errorMessage = data?.message || '發生未知錯誤';
				showMessage.error(errorMessage);
			}
		} else if (error.request) {
			showMessage.error('無法連接到服務器，請檢查網絡連接');
		} else {
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
