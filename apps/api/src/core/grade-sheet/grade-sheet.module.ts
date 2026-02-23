import { Module } from '@nestjs/common';
import { GradeSheetController } from './grade-sheet.controller';
import { GradeSheetService } from './grade-sheet.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [GradeSheetController],
	providers: [GradeSheetService],
	exports: [GradeSheetService],
})
export class GradeSheetModule {}
