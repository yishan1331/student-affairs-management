export interface IHealthWeight {
	id: number;
	user_id: number;
	pet_id?: number;
	date: Date;
	weight: number;
	height?: number;
	bmi?: number;
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

export interface ICreateHealthWeight {
	date: string;
	weight: number;
	height?: number;
	bmi?: number;
	note?: string;
	pet_id?: number;
}

export interface IUpdateHealthWeight {
	date?: string;
	weight?: number;
	height?: number;
	bmi?: number;
	note?: string;
	pet_id?: number;
}
