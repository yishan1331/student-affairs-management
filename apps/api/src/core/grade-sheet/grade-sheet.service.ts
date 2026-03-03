import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

	async findAll(query: Prisma.GradeSheetFindManyArgs, userId: number, isAdmin: boolean) {
		const where = isAdmin ? query.where : { ...query.where, user_id: userId };
		return this.prisma.gradeSheet.findMany({ ...query, where });
	}

	async count(where: Prisma.GradeSheetWhereInput, userId: number, isAdmin: boolean) {
		const finalWhere = isAdmin ? where : { ...where, user_id: userId };
		return this.prisma.gradeSheet.count({ where: finalWhere });
	}

	async findOne(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.gradeSheet.findUnique({
			where: { id },
			include: {
				student: true,
			},
		});
		if (!record) throw new NotFoundException('找不到該成績紀錄');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限存取此成績紀錄');
		}
		return record;
	}

	async update(id: number, updateGradeSheetDto: UpdateGradeSheetDto, userId: number, isAdmin: boolean) {
		const record = await this.prisma.gradeSheet.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該成績紀錄');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限修改此成績紀錄');
		}
		return this.prisma.gradeSheet.update({
			where: { id },
			data: updateGradeSheetDto,
		});
	}

	async remove(id: number, userId: number, isAdmin: boolean) {
		const record = await this.prisma.gradeSheet.findUnique({ where: { id } });
		if (!record) throw new NotFoundException('找不到該成績紀錄');
		if (!isAdmin && record.user_id !== userId) {
			throw new ForbiddenException('無權限刪除此成績紀錄');
		}
		return this.prisma.gradeSheet.delete({
			where: { id },
		});
	}

	async exportGradeSheets(courseId: number | undefined, userId: number, isAdmin: boolean) {
		const where: Prisma.GradeSheetWhereInput = {};
		if (courseId) where.student = { course_id: courseId };
		if (!isAdmin) where.user_id = userId;
		return this.prisma.gradeSheet.findMany({
			where,
			include: { student: true },
			orderBy: { exam_date: 'desc' },
		});
	}

	async getStatistics(course_id: number | undefined, userId: number, isAdmin: boolean) {
		const where: Prisma.GradeSheetWhereInput = {};
		if (course_id) where.student = { course_id };
		if (!isAdmin) where.user_id = userId;

		const grades = await this.prisma.gradeSheet.findMany({
			where,
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
