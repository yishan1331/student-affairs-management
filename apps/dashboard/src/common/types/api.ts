/**
 * API 響應的通用介面
 */
export interface ApiResponse<T> {
	statusCode: number;
	success: boolean;
	timestamp: string;
	data: T;
	operationTime: number;
	bytesTransferred: number;
}

/**
 * API 錯誤響應的介面
 */
export interface ApiError {
	statusCode: number;
	success: boolean;
	timestamp: string;
	message: string;
	error?: string;
	[key: string]: any;
}
