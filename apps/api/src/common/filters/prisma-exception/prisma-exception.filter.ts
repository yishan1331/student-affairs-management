import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	catch(
		exception: Prisma.PrismaClientKnownRequestError,
		host: ArgumentsHost,
	) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		let status = HttpStatus.INTERNAL_SERVER_ERROR;
		let message = '內部伺服器錯誤';

		switch (exception.code) {
			case 'P2002': // 唯一性約束錯誤
				status = HttpStatus.CONFLICT;
				const field = this.extractFieldFromError(exception.message);
				message = `此${field}已被使用`;
				break;
			case 'P2003': // 外鍵約束錯誤
				status = HttpStatus.BAD_REQUEST;
				message = '尚有關聯資料，無法刪除';
				break;
			case 'P2014': // 必填欄位缺失
				status = HttpStatus.BAD_REQUEST;
				const requiredField = this.extractFieldFromError(
					exception.message,
				);
				message = `${requiredField}為必填欄位`;
				break;
			case 'P2025': // 記錄不存在
				status = HttpStatus.NOT_FOUND;
				message = '找不到指定的記錄';
				break;
			case 'P2006': // 欄位驗證錯誤
				status = HttpStatus.BAD_REQUEST;
				const invalidField = this.extractFieldFromError(
					exception.message,
				);
				message = `${invalidField}格式不正確`;
				break;
			case 'P2012': // 必填欄位為空
				status = HttpStatus.BAD_REQUEST;
				const emptyField = this.extractFieldFromError(
					exception.message,
				);
				message = `${emptyField}不能為空`;
				break;
			case 'P2007': // 資料型別錯誤
				status = HttpStatus.BAD_REQUEST;
				const typeField = this.extractFieldFromError(exception.message);
				message = `${typeField}型別不正確`;
				break;
			case 'P2015': // 關聯記錄不存在
				status = HttpStatus.NOT_FOUND;
				message = '關聯的記錄不存在';
				break;
			case 'P2021': // 表格不存在
				status = HttpStatus.INTERNAL_SERVER_ERROR;
				message = '資料表不存在';
				break;
			case 'P2022': // 欄位不存在
				status = HttpStatus.BAD_REQUEST;
				const missingField = this.extractFieldFromError(
					exception.message,
				);
				message = `欄位 ${missingField} 不存在`;
				break;
			case 'P2023': // 無效的資料型別
				status = HttpStatus.BAD_REQUEST;
				message = '無效的資料型別';
				break;
			case 'P2024': // 連線逾時
				status = HttpStatus.REQUEST_TIMEOUT;
				message = '資料庫連線逾時';
				break;
			case 'P2026': // 資料庫連線錯誤
				status = HttpStatus.SERVICE_UNAVAILABLE;
				message = '資料庫連線錯誤';
				break;
			case 'P2027': // 資料庫查詢錯誤
				status = HttpStatus.BAD_REQUEST;
				message = '資料庫查詢錯誤';
				break;
			case 'P2028': // 交易錯誤
				status = HttpStatus.INTERNAL_SERVER_ERROR;
				message = '資料庫交易錯誤';
				break;
		}

		response.status(status).json({
			statusCode: status,
			success: false,
			timestamp: new Date().toISOString(),
			message: message,
			error: exception.code,
		});
	}

	private extractFieldFromError(message: string): string {
		const fieldMatch = message.match(/fields: \(`(.+?)`\)/);
		if (fieldMatch && fieldMatch[1]) {
			return fieldMatch[1];
		}
		return '欄位';
	}
}
