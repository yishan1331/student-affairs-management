import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port = configService.get('PORT');
	app.setGlobalPrefix('api');
	app.enableCors();
	console.log(port);
	await app.listen(port);
}
bootstrap();
