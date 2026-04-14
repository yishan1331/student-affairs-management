import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
} from '@nestjs/common';

import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		let message: string | string[] = 'Internal server error';
		if (exception instanceof HttpException) {
			const exceptionResponse = exception.getResponse();
			if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
				message = (exceptionResponse as any).message || exception.message;
			} else {
				message = exception.message;
			}
		}

		if (response.headersSent) return;

		response.status(status).json({
			statusCode: status,
			success: false,
			timestamp: new Date().toISOString(),
			message,
		});
	}
}
