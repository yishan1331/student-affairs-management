import { MealType, ToiletType, PetType, SymptomType, Severity } from "./types/models";

export const TOKEN_KEY = "SAMS";

// API基礎URL配置
export const BASE_URL = import.meta.env.VITE_API_URL;

// 健康管理 - 餐別對照
export const MEAL_TYPE_MAP: Record<MealType, { label: string; color: string }> = {
	[MealType.breakfast]: { label: "早餐", color: "orange" },
	[MealType.lunch]: { label: "午餐", color: "green" },
	[MealType.dinner]: { label: "晚餐", color: "blue" },
	[MealType.snack]: { label: "點心", color: "purple" },
};

// 健康管理 - 如廁類型對照
export const TOILET_TYPE_MAP: Record<ToiletType, { label: string; color: string }> = {
	[ToiletType.urination]: { label: "小便", color: "blue" },
	[ToiletType.defecation]: { label: "大便", color: "orange" },
};

// 健康管理 - 症狀類型對照
export const SYMPTOM_TYPE_MAP: Record<SymptomType, { label: string; color: string }> = {
	[SymptomType.vomiting]: { label: "嘔吐", color: "red" },
	[SymptomType.coughing]: { label: "咳嗽", color: "orange" },
	[SymptomType.diarrhea]: { label: "腹瀉", color: "volcano" },
	[SymptomType.skin_issue]: { label: "皮膚異常", color: "magenta" },
	[SymptomType.eye_issue]: { label: "眼睛異常", color: "purple" },
	[SymptomType.ear_issue]: { label: "耳朵異常", color: "geekblue" },
	[SymptomType.appetite_loss]: { label: "食慾不振", color: "gold" },
	[SymptomType.lethargy]: { label: "精神不佳", color: "lime" },
	[SymptomType.breathing_issue]: { label: "呼吸異常", color: "cyan" },
	[SymptomType.limping]: { label: "跛行", color: "blue" },
	[SymptomType.scratching]: { label: "抓癢", color: "green" },
	[SymptomType.sneezing]: { label: "打噴嚏", color: "default" },
	[SymptomType.fever]: { label: "發燒", color: "red" },
	[SymptomType.other]: { label: "其他", color: "default" },
};

// 健康管理 - 嚴重程度對照
export const SEVERITY_MAP: Record<Severity, { label: string; color: string }> = {
	[Severity.mild]: { label: "輕微", color: "green" },
	[Severity.moderate]: { label: "中度", color: "orange" },
	[Severity.severe]: { label: "嚴重", color: "red" },
};

// 寵物管理 - 寵物類型對照
export const PET_TYPE_MAP: Record<PetType, { label: string; color: string }> = {
	[PetType.dog]: { label: "狗", color: "orange" },
	[PetType.cat]: { label: "貓", color: "purple" },
	[PetType.bird]: { label: "鳥", color: "cyan" },
	[PetType.fish]: { label: "魚", color: "blue" },
	[PetType.hamster]: { label: "倉鼠", color: "gold" },
	[PetType.rabbit]: { label: "兔", color: "pink" },
	[PetType.other]: { label: "其他", color: "default" },
};

// 寵物管理 - 性別對照
export const PET_GENDER_MAP: Record<string, { label: string; color: string }> = {
	male: { label: "公", color: "blue" },
	female: { label: "母", color: "magenta" },
	unknown: { label: "未知", color: "default" },
};

export const ROUTE_RESOURCE = {
	schedule: "v1/course",
	course: "v1/course",
	school: "v1/school",
	student: "v1/student",
	attendance: "v1/attendance",
	gradeSheet: "v1/grade-sheet",
	user: "v1/user",
	salaryBase: "v1/salary-base",
	courseSession: "v1/course-session",
	healthWeight: "v1/health-weight",
	healthDiet: "v1/health-diet",
	healthToilet: "v1/health-toilet",
	healthSymptom: "v1/health-symptom",
	healthTrend: "v1/health-weight",
	pet: "v1/pet",
};
export const ROUTE_PATH = {
	schedule: "schedule",
	course: "course",
	school: "school",
	student: "student",
	attendance: "attendance",
	gradeSheet: "grade-sheet",
	user: "user",
	salaryBase: "salary-base",
	courseSession: "course-session",
	healthWeight: "health-weight",
	healthDiet: "health-diet",
	healthToilet: "health-toilet",
	healthSymptom: "health-symptom",
	healthTrend: "health-trend",
	pet: "pet",
};
