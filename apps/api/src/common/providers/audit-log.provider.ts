import { Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from '../interceptors/audit-log';

export const GLOBAL_AUDIT_LOG_INTERCEPTOR: Provider = {
	provide: APP_INTERCEPTOR,
	useClass: AuditLogInterceptor,
};
