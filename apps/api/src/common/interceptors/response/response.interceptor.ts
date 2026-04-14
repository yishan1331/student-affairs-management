import {
	CallHandler,
	ExecutionContext,
	Injectable,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const now = Date.now();
		const handler = next.handle();
		return handler.pipe(
			map((data) => {
				const operationTime = Date.now() - now;
				const bytesTransferred = Buffer.byteLength(
					JSON.stringify(data),
					'utf8',
				);

				const response = context.switchToHttp().getResponse();
				return {
					statusCode: response.statusCode,
					success: true,
					timestamp: new Date().toISOString(),
					data: data,
					operationTime,
					bytesTransferred,
				};
			}),
		);
	}
}
