export interface ICourse {
	id: number;
	name: string;
	description?: string;
	grade: number;
	school_id: number;
	start_time: Date;
	end_time: Date;
	day_of_week: string;
	duration: number;
	modifier_id?: number;
	created_at: Date;
	updated_at: Date;
}

export interface ICreateCourse {
	name: string;
	description?: string;
	grade: number;
	school_id: number;
	start_time: Date;
	end_time: Date;
	day_of_week: string;
	duration: number;
	modifier_id: number;
}

export interface IUpdateCourse {
	name?: string;
	description?: string;
	grade?: number;
	school_id?: number;
	start_time?: Date;
	end_time?: Date;
	day_of_week?: string;
	duration?: number;
	modifier_id?: number;
}
