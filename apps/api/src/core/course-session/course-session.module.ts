import { Module } from '@nestjs/common';
import { CourseSessionService } from './course-session.service';
import { CourseSessionController } from './course-session.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [CourseSessionController],
	providers: [CourseSessionService],
	exports: [CourseSessionService],
})
export class CourseSessionModule {}
