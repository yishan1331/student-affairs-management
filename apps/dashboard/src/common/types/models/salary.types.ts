export interface ISalaryBase {
	id: number;
	name: string;
	hourly_rate: number;
	min_students?: number | null;
	max_students?: number | null;
	description?: string;
	is_active: boolean;
	modifier_id?: number;
	created_at: Date;
	updated_at: Date;
	schools?: { id: number; name: string }[];
	school_ids?: number[];
}

export interface ICreateSalaryBase {
	name: string;
	school_ids: number[];
	hourly_rate: number;
	min_students?: number | null;
	max_students?: number | null;
	description?: string;
	is_active?: boolean;
	modifier_id?: number;
}

export interface IUpdateSalaryBase {
	name?: string;
	school_ids?: number[];
	hourly_rate?: number;
	min_students?: number | null;
	max_students?: number | null;
	description?: string;
	is_active?: boolean;
	modifier_id?: number;
}
