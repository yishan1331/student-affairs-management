export enum ToiletType {
	urination = "urination",
	defecation = "defecation",
}

export interface IHealthToilet {
	id: number;
	user_id: number;
	pet_id?: number;
	date: Date;
	time: string;
	type: ToiletType;
	is_normal: boolean;
	note?: string;
	created_at: Date;
	updated_at: Date;
	user?: {
		id: number;
		username: string;
	};
	pet?: {
		id: number;
		name: string;
		type: string;
	};
}

export interface ICreateHealthToilet {
	date: string;
	time: string;
	type: ToiletType;
	is_normal?: boolean;
	note?: string;
	pet_id?: number;
}

export interface IUpdateHealthToilet {
	date?: string;
	time?: string;
	type?: ToiletType;
	is_normal?: boolean;
	note?: string;
	pet_id?: number;
}
