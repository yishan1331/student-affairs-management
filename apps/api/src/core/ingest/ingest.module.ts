import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { HealthWeightModule } from '../health-weight/health-weight.module';
import { HealthToiletModule } from '../health-toilet/health-toilet.module';
import { IngestController } from './ingest.controller';

@Module({
	imports: [PrismaModule, HealthWeightModule, HealthToiletModule],
	controllers: [IngestController],
})
export class IngestModule {}
