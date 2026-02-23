import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const moment = require('moment');

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const now = Date.now();
		const handler = next.handle();
		return handler.pipe(
			// 包裝回傳格式
			map((data) => {
				const operationTime = Date.now() - now;
				// 計算傳輸大小
				const bytesTransferred = Buffer.byteLength(
					JSON.stringify(data),
					'utf8',
				);

				const response = context.switchToHttp().getResponse();
				return {
					statusCode: response.statusCode,
					success: true,
					timestamp: moment().format('YYYY-MM-DD HH:mm:ss'), // 格式化時間
					data: data,
					operationTime,
					bytesTransferred,
				};
			}),
		);
	}
}
