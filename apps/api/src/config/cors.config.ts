import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const whitelist = [
	'https://astrid-app.vercel.app',
	'http://localhost:5173',
];

// 允許 Vercel / Zeabur preview deployment URLs
const isAllowedOrigin = (origin: string): boolean => {
	if (whitelist.includes(origin)) return true;
	// Vercel preview: astrid-xxx-yishan1331s-projects.vercel.app
	if (/^https:\/\/astrid-.*\.vercel\.app$/.test(origin)) return true;
	// Zeabur: *.zeabur.app
	if (/^https:\/\/.*\.zeabur\.app$/.test(origin)) return true;
	return false;
};

export const corsOptions: CorsOptions = {
	origin: (origin, callback) => {
		// 如果沒有 origin（例如 curl 或同源請求），允許
		if (!origin) return callback(null, true);

		if (isAllowedOrigin(origin)) {
			return callback(null, true);
		}

		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	credentials: true,
	exposedHeaders: ['x-total-count'],
};
