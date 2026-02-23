export enum AttendanceStatus {
	attendance = "attendance",
	absent = "absent",
	late = "late",
	excused = "excused",
}

export interface IAttendance {
	id: number;
	student_id: number;
	date: Date;
	status: AttendanceStatus;
	modifier_id: number;
	created_at: Date;
	updated_at: Date;
	student?: {
		id: number;
		name: string;
		number: string;
	};
}

export interface ICreateAttendance {
	student_id: number;
	date: string;
	status: AttendanceStatus;
	modifier_id: number;
}

export interface IUpdateAttendance {
	student_id?: number;
	date?: string;
	status?: AttendanceStatus;
	modifier_id?: number;
}
