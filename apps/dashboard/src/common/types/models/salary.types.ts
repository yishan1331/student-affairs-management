export interface ISalaryBase {
	id: number;
	name: string;
	school_id: number;
	hourly_rate: number;
	description?: string;
	is_active: boolean;
	modifier_id?: number;
	created_at: Date;
	updated_at: Date;
	school?: { id: number; name: string };
}

export interface ICreateSalaryBase {
	name: string;
	school_id: number;
	hourly_rate: number;
	description?: string;
	is_active?: boolean;
	modifier_id?: number;
}

export interface IUpdateSalaryBase {
	name?: string;
	school_id?: number;
	hourly_rate?: number;
	description?: string;
	is_active?: boolean;
	modifier_id?: number;
}

export interface ITeacherSalaryConfig {
	id: number;
	course_id: number;
	salary_base_id: number;
	modifier_id?: number;
	created_at: Date;
	updated_at: Date;
	course?: {
		id: number;
		name: string;
		school?: { id: number; name: string };
	};
	salaryBase?: { id: number; name: string; hourly_rate: number };
}

export interface ICreateTeacherSalaryConfig {
	course_id: number;
	salary_base_id: number;
	modifier_id?: number;
}

export interface IUpdateTeacherSalaryConfig {
	course_id?: number;
	salary_base_id?: number;
	modifier_id?: number;
}
