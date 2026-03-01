import { MealType, ToiletType, PetType } from "./types/models";

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
	healthTrend: "health-trend",
	pet: "pet",
};
