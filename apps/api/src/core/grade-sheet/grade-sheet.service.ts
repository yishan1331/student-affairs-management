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

	async exportGradeSheets(courseId?: number) {
		const where = courseId ? { student: { course_id: courseId } } : {};
		return this.prisma.gradeSheet.findMany({
			where,
			include: { student: true },
			orderBy: { exam_date: 'desc' },
		});
	}

	async getStatistics(course_id: number) {
		const grades = await this.prisma.gradeSheet.findMany({
			where: { student: { course_id } },
			include: { student: true },
		});

		if (grades.length === 0) {
			return {
				courseId: course_id,
				totalStudents: 0,
				averageScore: 0,
				highestScore: 0,
				lowestScore: 0,
				distribution: {
					excellent: 0,
					good: 0,
					average: 0,
					passing: 0,
					failing: 0,
				},
			};
		}

		const scores = grades.map((g) => g.score);
		const distribution = {
			excellent: scores.filter((s) => s >= 90).length,
			good: scores.filter((s) => s >= 80 && s < 90).length,
			average: scores.filter((s) => s >= 70 && s < 80).length,
			passing: scores.filter((s) => s >= 60 && s < 70).length,
			failing: scores.filter((s) => s < 60).length,
		};

		return {
			courseId: course_id,
			totalStudents: scores.length,
			averageScore:
				Math.round(
					(scores.reduce((a, b) => a + b, 0) / scores.length) * 100,
				) / 100,
			highestScore: Math.max(...scores),
			lowestScore: Math.min(...scores),
			distribution,
		};
	}
}
