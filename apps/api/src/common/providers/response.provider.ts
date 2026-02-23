import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from '../interceptors/response';

export const GLOBAL_RESPONSE_INTERCEPTOR: Provider = {
	provide: APP_INTERCEPTOR,
	useClass: ResponseInterceptor,
};
