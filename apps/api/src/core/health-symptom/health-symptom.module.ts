import { Module } from '@nestjs/common';
import { HealthSymptomController } from './health-symptom.controller';
import { HealthSymptomService } from './health-symptom.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [HealthSymptomController],
	providers: [HealthSymptomService],
	exports: [HealthSymptomService],
})
export class HealthSymptomModule {}
