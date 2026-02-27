import { Module } from '@nestjs/common';
import { HealthWeightController } from './health-weight.controller';
import { HealthWeightService } from './health-weight.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [HealthWeightController],
	providers: [HealthWeightService],
	exports: [HealthWeightService],
})
export class HealthWeightModule {}
