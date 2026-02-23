export interface IUser {
	id: number;
	account: string;
	username: string;
	role: "admin" | "manager" | "staff";
	email?: string;
	status?: "active" | "inactive";
	created_at: Date;
	updated_at: Date;
}

export interface ICreateUser {
	account: string;
	password: string;
	username: string;
	role: "admin" | "manager" | "staff";
	email?: string;
	status?: "active" | "inactive";
}

export interface IUpdateUser {
	username?: string;
	password?: string;
	role?: "admin" | "manager" | "staff";
	email?: string;
	status?: "active" | "inactive";
}

export type User = IUser;
