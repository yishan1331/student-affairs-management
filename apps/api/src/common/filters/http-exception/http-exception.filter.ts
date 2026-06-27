import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger('ExceptionFilter');

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

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

		// 5xx 連同 stack trace 寫進 stderr，Zeabur runtime log 才看得到。
		// 4xx 的 access line 由 LoggingInterceptor 負責，這裡不重複記錄。
		if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
			const where = `${request?.method} ${request?.originalUrl || request?.url}`;
			const stack = exception instanceof Error ? exception.stack : undefined;
			this.logger.error(`${where} ${status} - ${JSON.stringify(message)}`, stack);
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
