import { NestFactory } from '@nestjs/core';
import { createServer } from 'aws-serverless-express';
import { Request, Response } from 'express';
import { Server } from 'http';

import { AppModule } from './app.module';
import { corsOptions } from './config/cors.config';

let cachedServer: Server;

async function bootstrap(): Promise<Server> {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api');
	app.enableCors(corsOptions);
	await app.init();
	const expressApp = app.getHttpAdapter().getInstance();
	return createServer(expressApp);
}

export default async function handler(req: Request, res: Response) {
	if (!cachedServer) {
		cachedServer = await bootstrap();
	}

	// 改為直接處理 HTTP request
	cachedServer.emit('request', req, res);
}
