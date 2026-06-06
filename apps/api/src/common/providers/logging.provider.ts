import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from '../interceptors/logging';

export const GLOBAL_LOGGING_INTERCEPTOR: Provider = {
	provide: APP_INTERCEPTOR,
	useClass: LoggingInterceptor,
};
