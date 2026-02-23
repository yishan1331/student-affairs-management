import { Module } from '@nestjs/common';
import { SalaryBaseService } from './salary-base.service';
import { SalaryBaseController } from './salary-base.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [SalaryBaseController],
	providers: [SalaryBaseService],
	exports: [SalaryBaseService],
})
export class SalaryBaseModule {}
