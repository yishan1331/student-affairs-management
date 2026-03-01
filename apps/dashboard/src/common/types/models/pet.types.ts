export enum PetType {
	dog = "dog",
	cat = "cat",
	bird = "bird",
	fish = "fish",
	hamster = "hamster",
	rabbit = "rabbit",
	other = "other",
}

export interface IPet {
	id: number;
	name: string;
	type: PetType;
	breed?: string;
	gender?: string;
	birthday?: Date;
	weight?: number;
	avatar_url?: string;
	note?: string;
	is_active: boolean;
	user_id: number;
	created_at: Date;
	updated_at: Date;
	user?: {
		id: number;
		username: string;
	};
}

export interface ICreatePet {
	name: string;
	type: PetType;
	breed?: string;
	gender?: string;
	birthday?: string;
	weight?: number;
	avatar_url?: string;
	note?: string;
	is_active?: boolean;
}

export interface IUpdatePet {
	name?: string;
	type?: PetType;
	breed?: string;
	gender?: string;
	birthday?: string;
	weight?: number;
	avatar_url?: string;
	note?: string;
	is_active?: boolean;
}
