import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const whitelist = ['https://student-management-system-dashboard.vercel.app'];

export const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		// 如果沒有 origin（例如 curl 或同源請求），允許
		if (!origin) return callback(null, true);

		if (whitelist.includes(origin)) {
			return callback(null, true);
		}

		// ⚠️ fallback：如果在 serverless 中不穩，可以開 origin: true 改這裡
		// return callback(null, true); // ← 若想放行所有 request 可打開這行
		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	credentials: true,
};
