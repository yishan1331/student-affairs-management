export enum MealType {
	breakfast = "breakfast",
	lunch = "lunch",
	dinner = "dinner",
	snack = "snack",
}

export interface IHealthDiet {
	id: number;
	user_id: number;
	pet_id?: number;
	date: Date;
	meal_type: MealType;
	food_name: string;
	amount?: string;
	calories?: number;
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

export interface ICreateHealthDiet {
	date: string;
	meal_type: MealType;
	food_name: string;
	amount?: string;
	calories?: number;
	note?: string;
	pet_id?: number;
}

export interface IUpdateHealthDiet {
	date?: string;
	meal_type?: MealType;
	food_name?: string;
	amount?: string;
	calories?: number;
	note?: string;
	pet_id?: number;
}
