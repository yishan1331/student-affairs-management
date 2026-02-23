import { ApiResponse, ApiError } from '../common/types/api';

/**
 * 類型守衛：檢查是否為有效的 API 響應
 */
export function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
	if (typeof data !== 'object' || data === null) {
		return false;
	}

	return 'statusCode' in data && 'success' in data;
}

/**
 * 類型守衛：檢查是否為 API 錯誤響應
 */
export function isApiError(data: unknown): data is ApiError {
	if (typeof data !== 'object' || data === null) {
		return false;
	}

	return 'statusCode' in data && 'success' in data && 'message' in data;
}

/**
 * 從 API 響應中安全地提取數據
 */
export function extractApiData<T>(response: unknown): T | null {
	if (isApiResponse<T>(response)) {
		return (response as ApiResponse<T>).data;
	}
	return null;
}
