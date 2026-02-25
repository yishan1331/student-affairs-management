export const TOKEN_KEY = "SAMS";

// API基礎URL配置
export const BASE_URL = import.meta.env.VITE_API_URL;

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
};
