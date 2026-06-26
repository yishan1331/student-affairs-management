export type Subsystem = "course" | "health";

export interface IUser {
	id: number;
	account: string;
	username: string;
	role: "admin" | "user" | "guest";
	subsystems?: Subsystem[];
	email?: string;
	status?: "active" | "inactive";
	created_at: Date;
	updated_at: Date;
}

export interface ICreateUser {
	account: string;
	password: string;
	username: string;
	role: "admin" | "user" | "guest";
	subsystems?: Subsystem[];
	email?: string;
	status?: "active" | "inactive";
}

export interface IUpdateUser {
	username?: string;
	password?: string;
	role?: "admin" | "user" | "guest";
	subsystems?: Subsystem[];
	email?: string;
	status?: "active" | "inactive";
}

export type User = IUser;
