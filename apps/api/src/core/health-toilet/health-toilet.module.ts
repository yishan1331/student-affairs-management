import { Module } from '@nestjs/common';
import { HealthToiletController } from './health-toilet.controller';
import { HealthToiletService } from './health-toilet.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [HealthToiletController],
	providers: [HealthToiletService],
	exports: [HealthToiletService],
})
export class HealthToiletModule {}
