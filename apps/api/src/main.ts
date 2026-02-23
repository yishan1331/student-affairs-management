import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const port = configService.get('PORT');
	app.setGlobalPrefix('api');
	app.enableCors({
		exposedHeaders: ['x-total-count'],
	});

	const config = new DocumentBuilder()
		.setTitle('Student Affairs Management System API')
		.setDescription('學校課程管理系統 API 文件')
		.setVersion('1.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/docs', app, document);

	await app.listen(port);
}
bootstrap();
