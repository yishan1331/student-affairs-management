import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCourseSessionDto } from './dto/create-course-session.dto';
import { UpdateCourseSessionDto } from './dto/update-course-session.dto';
import { BatchGenerateCourseSessionDto } from './dto/batch-generate-course-session.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CourseSessionService {
	constructor(private prisma: PrismaService) {}

	/**
	 * Find the best matching SalaryBase tier for the given student count.
	 * Priority:
	 *   1. Most specific range (both min and max defined) that contains the count
	 *   2. Range with only min defined (no upper bound) that contains the count
	 *   3. Range with only max defined (no lower bound) that contains the count
	 *   4. Fixed rate (both min and max are null) as fallback
	 */
	private findMatchingSalaryBase(salaryBases: any[], actualStudentCount: number) {
		let bestMatch: any = null;
		let bestSpecificity = -1;

		for (const sb of salaryBases) {
			const minOk = sb.min_students == null || actualStudentCount >= sb.min_students;
			const maxOk = sb.max_students == null || actualStudentCount <= sb.max_students;

			if (!minOk || !maxOk) continue;

			// Calculate specificity: both defined = 2, one defined = 1, none = 0
			let specificity = 0;
			if (sb.min_students != null) specificity++;
			if (sb.max_students != null) specificity++;

			if (specificity > bestSpecificity) {
				bestSpecificity = specificity;
				bestMatch = sb;
			} else if (specificity === bestSpecificity && bestMatch) {
				// If same specificity, prefer the one with a tighter range
				const currentRange = (sb.max_students ?? Infinity) - (sb.min_students ?? 0);
				const bestRange = (bestMatch.max_students ?? Infinity) - (bestMatch.min_students ?? 0);
				if (currentRange < bestRange) {
					bestMatch = sb;
				}
			}
		}

		return bestMatch;
	}

	/**
	 * Calculate salary for a course session based on the matched salary tier.
	 */
	private async calculateSalary(courseId: number, actualStudentCount: number) {
		const course = await this.prisma.course.findUnique({
			where: { id: courseId },
			include: { school: true },
		});

		if (!course) {
			throw new NotFoundException(`Course with id ${courseId} not found`);
		}

		// Find all active SalaryBase records associated with this school
		const salaryBases = await this.prisma.salaryBase.findMany({
			where: {
				schools: { some: { id: course.school_id } },
				is_active: true,
			},
		});

		const matchedSalaryBase = this.findMatchingSalaryBase(salaryBases, actualStudentCount);

		if (!matchedSalaryBase) {
			return { salary_amount: null, salary_base_id: null };
		}

		// salary_amount = hourly_rate * (duration / 60)
		const salaryAmount = matchedSalaryBase.hourly_rate * (course.duration / 60);

		return {
			salary_amount: Math.round(salaryAmount * 100) / 100, // Round to 2 decimal places
			salary_base_id: matchedSalaryBase.id,
		};
	}

	async create(dto: CreateCourseSessionDto) {
		const isCancelled = dto.is_cancelled ?? false;

		// If cancelled, salary is 0; otherwise calculate normally
		let salary_amount: number | null = null;
		let salary_base_id: number | null = null;

		if (!isCancelled) {
			const calculated = await this.calculateSalary(
				dto.course_id,
				dto.actual_student_count,
			);
			salary_amount = calculated.salary_amount;
			salary_base_id = calculated.salary_base_id;
		}

		return this.prisma.courseSession.create({
			data: {
				course_id: dto.course_id,
				date: new Date(dto.date),
				actual_student_count: dto.actual_student_count,
				is_cancelled: isCancelled,
				salary_amount,
				salary_base_id,
				note: dto.note,
				modifier_id: dto.modifier_id,
			},
			include: {
				course: { include: { school: true } },
				salaryBase: true,
			},
		});
	}

	async findAll(query: Prisma.CourseSessionFindManyArgs) {
		// Always append course.start_time as secondary sort
		const primaryOrderBy = query.orderBy;
		const secondarySort = { course: { start_time: 'asc' as const } };
		const orderBy = primaryOrderBy
			? (Array.isArray(primaryOrderBy)
				? [...primaryOrderBy, secondarySort]
				: [primaryOrderBy, secondarySort])
			: [{ date: 'asc' as const }, secondarySort];

		return this.prisma.courseSession.findMany({
			...query,
			orderBy,
			include: {
				course: { include: { school: true } },
				salaryBase: true,
			},
		});
	}

	async count(where: Prisma.CourseSessionWhereInput) {
		return this.prisma.courseSession.count({ where });
	}

	async findOne(id: number) {
		return this.prisma.courseSession.findUnique({
			where: { id },
			include: {
				course: { include: { school: true } },
				salaryBase: true,
			},
		});
	}

	async update(id: number, dto: UpdateCourseSessionDto) {
		// Get existing record for fallback values
		const existing = await this.prisma.courseSession.findUnique({
			where: { id },
		});

		if (!existing) {
			throw new NotFoundException(`CourseSession with id ${id} not found`);
		}

		const isCancelled = dto.is_cancelled ?? existing.is_cancelled;

		// If session is cancelled, salary should be 0
		if (isCancelled) {
			return this.prisma.courseSession.update({
				where: { id },
				data: {
					...dto,
					date: dto.date ? new Date(dto.date) : undefined,
					is_cancelled: true,
					salary_amount: null,
					salary_base_id: null,
				},
				include: {
					course: { include: { school: true } },
					salaryBase: true,
				},
			});
		}

		// If not cancelled and actual_student_count or course_id changes, recalculate salary
		if (
			dto.actual_student_count !== undefined ||
			dto.course_id !== undefined ||
			dto.is_cancelled === false // Re-activating a cancelled session
		) {
			const courseId = dto.course_id ?? existing.course_id;
			const studentCount = dto.actual_student_count ?? existing.actual_student_count;

			const { salary_amount, salary_base_id } = await this.calculateSalary(
				courseId,
				studentCount,
			);

			return this.prisma.courseSession.update({
				where: { id },
				data: {
					...dto,
					date: dto.date ? new Date(dto.date) : undefined,
					is_cancelled: false,
					salary_amount,
					salary_base_id,
				},
				include: {
					course: { include: { school: true } },
					salaryBase: true,
				},
			});
		}

		return this.prisma.courseSession.update({
			where: { id },
			data: {
				...dto,
				date: dto.date ? new Date(dto.date) : undefined,
			},
			include: {
				course: { include: { school: true } },
				salaryBase: true,
			},
		});
	}

	async remove(id: number) {
		return this.prisma.courseSession.delete({ where: { id } });
	}

	async batchGenerate(dto: BatchGenerateCourseSessionDto) {
		const results: any[] = [];

		for (const courseId of dto.course_ids) {
			const course = await this.prisma.course.findUnique({
				where: { id: courseId },
			});
			if (!course) continue;

			// Parse day_of_week (e.g., "1,3,5" = Mon, Wed, Fri)
			const daysOfWeek = course.day_of_week
				.split(',')
				.map((d) => parseInt(d.trim()));

			// Generate all dates in the given month that match day_of_week
			// Note: day_of_week uses 1=Monday, 7=Sunday
			// JavaScript Date.getDay() uses 0=Sunday, 1=Monday, ..., 6=Saturday
			const year = dto.year;
			const month = dto.month - 1; // JS months are 0-indexed
			const firstDay = new Date(year, month, 1);
			const lastDay = new Date(year, month + 1, 0);

			const dates: Date[] = [];
			for (
				let d = new Date(firstDay);
				d <= lastDay;
				d.setDate(d.getDate() + 1)
			) {
				// Convert JS getDay (0=Sun) to our format (1=Mon, 7=Sun)
				let dayNum = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
				dayNum = dayNum === 0 ? 7 : dayNum; // Convert: 0->7, 1->1, ..., 6->6

				if (daysOfWeek.includes(dayNum)) {
					dates.push(new Date(d));
				}
			}

			// Check for existing sessions to avoid duplicates
			const existingSessions = await this.prisma.courseSession.findMany({
				where: {
					course_id: courseId,
					date: {
						gte: firstDay,
						lte: lastDay,
					},
				},
			});
			const existingDates = new Set(
				existingSessions.map((s) => s.date.toISOString().split('T')[0]),
			);

			// Create sessions for dates that don't exist yet
			for (const date of dates) {
				const dateStr = date.toISOString().split('T')[0];
				if (existingDates.has(dateStr)) continue;

				const session = await this.prisma.courseSession.create({
					data: {
						course_id: courseId,
						date: date,
						actual_student_count: 0,
						is_cancelled: false,
						salary_amount: null,
						salary_base_id: null,
						note: null,
						modifier_id: dto.modifier_id,
					},
				});
				results.push(session);
			}
		}

		return { created: results.length, sessions: results };
	}

	async getSalarySummary(startDate: string, endDate: string, schoolId?: number) {
		const where: Prisma.CourseSessionWhereInput = {
			date: {
				gte: new Date(startDate),
				lte: new Date(endDate),
			},
			is_cancelled: false, // Exclude cancelled sessions from salary totals
		};

		if (schoolId) {
			where.course = { school_id: schoolId };
		}

		const sessions = await this.prisma.courseSession.findMany({
			where,
			include: {
				course: { include: { school: true } },
				salaryBase: true,
			},
			orderBy: { date: 'asc' },
		});

		// Group by school then by course
		const schoolMap = new Map<number, {
			schoolId: number;
			schoolName: string;
			courses: Map<number, {
				courseId: number;
				courseName: string;
				sessionCount: number;
				totalSalary: number;
				sessions: {
					date: Date;
					studentCount: number;
					salaryAmount: number | null;
					salaryBaseName: string | null;
				}[];
			}>;
			totalSalary: number;
		}>();

		for (const session of sessions) {
			const school = session.course.school;
			if (!schoolMap.has(school.id)) {
				schoolMap.set(school.id, {
					schoolId: school.id,
					schoolName: school.name,
					courses: new Map(),
					totalSalary: 0,
				});
			}

			const schoolEntry = schoolMap.get(school.id)!;
			const course = session.course;

			if (!schoolEntry.courses.has(course.id)) {
				schoolEntry.courses.set(course.id, {
					courseId: course.id,
					courseName: course.name,
					sessionCount: 0,
					totalSalary: 0,
					sessions: [],
				});
			}

			const courseEntry = schoolEntry.courses.get(course.id)!;
			courseEntry.sessionCount++;
			courseEntry.totalSalary += session.salary_amount ?? 0;
			schoolEntry.totalSalary += session.salary_amount ?? 0;

			courseEntry.sessions.push({
				date: session.date,
				studentCount: session.actual_student_count,
				salaryAmount: session.salary_amount,
				salaryBaseName: session.salaryBase?.name ?? null,
			});
		}

		// Convert maps to arrays
		return Array.from(schoolMap.values()).map((school) => ({
			schoolId: school.schoolId,
			schoolName: school.schoolName,
			courses: Array.from(school.courses.values()),
			totalSalary: Math.round(school.totalSalary * 100) / 100,
		}));
	}
}
