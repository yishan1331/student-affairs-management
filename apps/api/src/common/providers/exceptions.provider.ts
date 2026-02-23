import { Provider } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter, PrismaExceptionFilter } from '../filters';

export const GLOBAL_EXCEPTIONS_FILTER: Provider = {
	provide: APP_FILTER,
	useClass: HttpExceptionFilter,
};
export const GLOBAL_PRISMA_EXCEPTIONS_FILTER: Provider = {
	provide: APP_FILTER,
	useClass: PrismaExceptionFilter,
};
