export interface ISchool {
	id: number;
	code: string;
	name: string;
	description?: string;
	address?: string;
	is_active?: boolean;
	modifier_id?: number;
	created_at: Date;
	updated_at: Date;
}

export interface ICreateSchool {
	code: string;
	name: string;
	description?: string;
	address?: string;
	is_active?: boolean;
	modifier_id: number;
}

export interface IUpdateSchool {
	code?: string;
	name?: string;
	description?: string;
	address?: string;
	is_active?: boolean;
	modifier_id?: number;
}
