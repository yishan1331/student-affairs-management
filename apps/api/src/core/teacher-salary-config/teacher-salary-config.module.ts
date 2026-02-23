import { Module } from '@nestjs/common';
import { TeacherSalaryConfigService } from './teacher-salary-config.service';
import { TeacherSalaryConfigController } from './teacher-salary-config.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [TeacherSalaryConfigController],
	providers: [TeacherSalaryConfigService],
	exports: [TeacherSalaryConfigService],
})
export class TeacherSalaryConfigModule {}
