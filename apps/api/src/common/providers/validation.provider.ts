import { Provider, ValidationPipe } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';

export const GLOBAL_VALIDATION_PIPE: Provider = {
	provide: APP_PIPE,
	useFactory: () => {
		return new ValidationPipe({
			whitelist: true, // 過濾掉不在 DTO 裡面的欄位
			forbidNonWhitelisted: true, // 如果有不合法欄位直接報錯
			transform: true, // 自動轉換 payload 型別
			stopAtFirstError: true,
		});
	},
};
