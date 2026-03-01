import { Module } from '@nestjs/common';
import { PetController } from './pet.controller';
import { PetService } from './pet.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [PetController],
	providers: [PetService],
	exports: [PetService],
})
export class PetModule {}
