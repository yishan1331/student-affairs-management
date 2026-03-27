export interface ICourseSession {
	id: number;
	course_id?: number | null;
	course_name?: string | null;
	school_id?: number | null;
	duration?: number | null;
	date: string;
	actual_student_count: number;
	is_cancelled: boolean;
	salary_amount?: number | null;
	salary_base_id?: number | null;
	note?: string;
	modifier_id?: number;
	created_at: Date;
	updated_at: Date;
	course?: {
		id: number;
		name: string;
		start_time?: string;
		end_time?: string;
		duration?: number;
		school?: { id: number; name: string };
	} | null;
	school?: { id: number; name: string } | null;
	salaryBase?: { id: number; name: string; hourly_rate: number } | null;
}

export interface ICreateCourseSession {
	course_id?: number;
	course_name?: string;
	school_id?: number;
	duration?: number;
	date: string;
	actual_student_count?: number;
	is_cancelled?: boolean;
	note?: string;
	modifier_id?: number;
}

export interface IUpdateCourseSession {
	course_id?: number;
	course_name?: string;
	school_id?: number;
	duration?: number;
	date?: string;
	actual_student_count?: number;
	is_cancelled?: boolean;
	note?: string;
	modifier_id?: number;
}
