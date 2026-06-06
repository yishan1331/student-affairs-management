import {
	CallHandler,
	ExecutionContext,
	HttpException,
	HttpStatus,
	Injectable,
	Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 逐筆記錄 HTTP request 到 stdout（Zeabur runtime log 會擷取）。
 * 格式：METHOD URL STATUS DURATIONms - user:ID ip:IP
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger('HTTP');

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const { method } = request;
		const url = request.originalUrl || request.url;
		const ip = request.ip || request.headers['x-forwarded-for'] || '-';
		const now = Date.now();

		const userId = () => {
			const user = request.user;
			return user?.sub || user?.id || 'anonymous';
		};

		return next.handle().pipe(
			tap({
				next: () => {
					const status = context.switchToHttp().getResponse().statusCode;
					const ms = Date.now() - now;
					this.logger.log(
						`${method} ${url} ${status} ${ms}ms - user:${userId()} ip:${ip}`,
					);
				},
				error: (err) => {
					const status =
						err instanceof HttpException
							? err.getStatus()
							: HttpStatus.INTERNAL_SERVER_ERROR;
					const ms = Date.now() - now;
					const line = `${method} ${url} ${status} ${ms}ms - user:${userId()} ip:${ip}`;
					if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
						this.logger.error(line);
					} else {
						this.logger.warn(line);
					}
				},
			}),
		);
	}
}
