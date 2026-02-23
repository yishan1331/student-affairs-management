import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGradeSheetDto } from './dto/create-grade-sheet.dto';
import { UpdateGradeSheetDto } from './dto/update-grade-sheet.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GradeSheetService {
	constructor(private prisma: PrismaService) {}

	async create(createGradeSheetDto: CreateGradeSheetDto) {
		return this.prisma.gradeSheet.create({
			data: createGradeSheetDto,
		});
	}

	async findAll(query: Prisma.GradeSheetFindManyArgs) {
		return this.prisma.gradeSheet.findMany(query);
	}

	async findOne(id: number) {
		return this.prisma.gradeSheet.findUnique({
			where: { id },
			include: {
				student: true,
			},
		});
	}

	async update(id: number, updateGradeSheetDto: UpdateGradeSheetDto) {
		return this.prisma.gradeSheet.update({
			where: { id },
			data: updateGradeSheetDto,
		});
	}

	async remove(id: number) {
		return this.prisma.gradeSheet.delete({
			where: { id },
		});
	}
}
