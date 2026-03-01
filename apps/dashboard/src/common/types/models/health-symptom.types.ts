export enum SymptomType {
	vomiting = "vomiting",
	coughing = "coughing",
	diarrhea = "diarrhea",
	skin_issue = "skin_issue",
	eye_issue = "eye_issue",
	ear_issue = "ear_issue",
	appetite_loss = "appetite_loss",
	lethargy = "lethargy",
	breathing_issue = "breathing_issue",
	limping = "limping",
	scratching = "scratching",
	sneezing = "sneezing",
	fever = "fever",
	other = "other",
}

export enum Severity {
	mild = "mild",
	moderate = "moderate",
	severe = "severe",
}

export interface IHealthSymptom {
	id: number;
	user_id: number;
	pet_id?: number;
	date: Date;
	time: string;
	symptom_type: SymptomType;
	severity: Severity;
	frequency: number;
	duration_minutes?: number;
	body_part?: string;
	is_recurring: boolean;
	description?: string;
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

export interface ICreateHealthSymptom {
	date: string;
	time: string;
	symptom_type: SymptomType;
	severity: Severity;
	frequency?: number;
	duration_minutes?: number;
	body_part?: string;
	is_recurring?: boolean;
	description?: string;
	note?: string;
	pet_id?: number;
}

export interface IUpdateHealthSymptom {
	date?: string;
	time?: string;
	symptom_type?: SymptomType;
	severity?: Severity;
	frequency?: number;
	duration_minutes?: number;
	body_part?: string;
	is_recurring?: boolean;
	description?: string;
	note?: string;
	pet_id?: number;
}
