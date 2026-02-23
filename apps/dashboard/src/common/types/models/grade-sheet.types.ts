export interface IGradeSheet {
	id: number;
	student_id: number;
	course_id: number;
	grade: number;
	modifier_id: number;
	created_at: Date;
	updated_at: Date;
}

export interface ICreateGradeSheet {
	student_id: number;
	course_id: number;
	grade: number;
	created_by_id: number;
}

export interface IUpdateGradeSheet {
	student_id?: number;
	course_id?: number;
	grade?: number;
	created_by_id?: number;
}
