import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';
import { HealthWeightModule } from '../health-weight/health-weight.module';
import { IngestController } from './ingest.controller';

@Module({
	imports: [PrismaModule, HealthWeightModule],
	controllers: [IngestController],
})
export class IngestModule {}
