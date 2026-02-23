export interface IGradeSheet {
	id: number;
	student_id: number;
	score: number;
	description?: string;
	exam_date: Date;
	modifier_id: number;
	created_at: Date;
	updated_at: Date;
	student?: {
		id: number;
		name: string;
		number: string;
	};
}

export interface ICreateGradeSheet {
	student_id: number;
	score: number;
	description?: string;
	exam_date: string;
	modifier_id: number;
}

export interface IUpdateGradeSheet {
	student_id?: number;
	score?: number;
	description?: string;
	exam_date?: string;
	modifier_id?: number;
}
