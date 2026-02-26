import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:8000/api';

// Mock user data
const mockUser = {
	id: '1',
	account: 'admin',
	username: 'Admin User',
	role: 'admin',
};

// Mock JWT token (admin role)
// Header: {"alg":"HS256","typ":"JWT"}
// Payload: {"sub":"1","username":"Admin User","role":"admin","exp":9999999999}
export const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwidXNlcm5hbWUiOiJBZG1pbiBVc2VyIiwicm9sZSI6ImFkbWluIiwiZXhwIjo5OTk5OTk5OTk5fQ.mock-signature';

export const handlers = [
	// Auth - Login
	http.post(`${API_URL}/auth/login`, () => {
		return HttpResponse.json({
			statusCode: 200,
			success: true,
			data: {
				access_token: MOCK_TOKEN,
			},
		});
	}),

	// Auth - Me
	http.get(`${API_URL}/auth/me`, () => {
		return HttpResponse.json({
			statusCode: 200,
			success: true,
			data: mockUser,
		});
	}),

	// School - List
	http.get(`${API_URL}/v1/school`, () => {
		return HttpResponse.json({
			statusCode: 200,
			success: true,
			data: [],
		});
	}),

	// Dashboard - Statistics
	http.get(`${API_URL}/v1/dashboard/statistics`, () => {
		return HttpResponse.json({
			statusCode: 200,
			success: true,
			data: {
				totalSchools: 5,
				totalCourses: 20,
				totalStudents: 100,
				todayAttendance: { present: 80, absent: 10, late: 10 },
			},
		});
	}),
];
