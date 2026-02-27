import { Module } from '@nestjs/common';
import { HealthDietController } from './health-diet.controller';
import { HealthDietService } from './health-diet.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [HealthDietController],
	providers: [HealthDietService],
	exports: [HealthDietService],
})
export class HealthDietModule {}
