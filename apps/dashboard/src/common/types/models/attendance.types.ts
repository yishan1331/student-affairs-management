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
	status: "present" | "absent" | "late" | "excused";
	modifier_id: number;
	created_at: Date;
	updated_at: Date;
}

export interface ICreateAttendance {
	student_id: number;
	date: Date;
	status: "present" | "absent" | "late" | "excused";
	notes: string;
	created_by_id: number;
}

export interface IUpdateAttendance {
	student_id?: number;
	date?: Date;
	status?: "present" | "absent" | "late" | "excused";
	notes?: string;
	created_by_id?: number;
}
