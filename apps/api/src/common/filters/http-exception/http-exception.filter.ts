import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';
const moment = require('moment');

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const message =
			exception instanceof HttpException
				? exception.message
				: 'Internal server error';

		response.status(status).json({
			statusCode: status,
			success: false,
			timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), // 錯誤發生時間
			message,
		});
	}
}
