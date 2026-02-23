export interface IStudent {
	id: number;
	name: string;
	number: string;
	gender: string;
	course_id: number;
	is_active: boolean;
	modifier_id: number;
	created_at: Date;
	updated_at: Date;
}

export interface ICreateStudent {
	name: string;
	number: string;
	gender: string;
	course_id: number;
	is_active: boolean;
	modifier_id: number;
}

export interface IUpdateStudent {
	name?: string;
	number?: string;
	gender?: string;
	course_id?: number;
	is_active?: boolean;
	modifier_id?: number;
}
