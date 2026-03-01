import React from "react";
import { Refine, Authenticated } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { ErrorComponent, useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import routerBindings, {
	NavigateToResource,
	DocumentTitleHandler,
	UnsavedChangesNotifier,
	CatchAllNavigate,
} from "@refinedev/react-router";
import { App as AntdApp } from "antd";
import { BrowserRouter, Route, Routes, Outlet } from "react-router";
import {
	MedicineBoxOutlined,
	AppstoreOutlined,
	BookOutlined,
	TeamOutlined,
	CheckCircleOutlined,
	FileTextOutlined,
	UserOutlined,
	DollarOutlined,
	ScheduleOutlined,
	FormOutlined,
	BarChartOutlined,
	SettingOutlined,
	ReadOutlined,
	HeartOutlined,
	LineChartOutlined,
} from "@ant-design/icons";

import { authProvider } from "./providers/authProvider";
import { accessControlProvider } from "./providers/accessControlProvider";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { apiClient } from "./services/api";
import { useGlobalMessage } from "./hooks/useGlobalMessage";
import {
	CustomHeader,
	CustomTitle,
	CustomSider,
	CustomLayout,
} from "./components";
import "./styles/global.scss";

import {
	SchoolList,
	SchoolCreate,
	SchoolEdit,
	SchoolShow,
} from "./pages/school";
import {
	CourseList,
	CourseCreate,
	CourseEdit,
	CourseShow,
} from "./pages/course";
import {
	StudentList,
	StudentCreate,
	StudentEdit,
	StudentShow,
} from "./pages/student";
import {
	AttendanceList,
	AttendanceCreate,
	AttendanceEdit,
	AttendanceShow,
} from "./pages/attendance";
import {
	GradeSheetList,
	GradeSheetCreate,
	GradeSheetEdit,
	GradeSheetShow,
} from "./pages/grade-sheet";
import {
	UserList,
	UserCreate,
	UserEdit,
	UserShow,
} from "./pages/user";
import {
	SalaryBaseList,
	SalaryBaseCreate,
	SalaryBaseEdit,
	SalaryBaseShow,
} from "./pages/salary-base";
import {
	CourseSessionList,
	CourseSessionCreate,
	CourseSessionEdit,
	CourseSessionShow,
} from "./pages/course-session";
import { SalaryOverviewList } from "./pages/salary-overview";
import {
	HealthWeightList,
	HealthWeightCreate,
	HealthWeightEdit,
	HealthWeightShow,
} from "./pages/health-weight";
import {
	HealthDietList,
	HealthDietCreate,
	HealthDietEdit,
	HealthDietShow,
} from "./pages/health-diet";
import {
	HealthToiletList,
	HealthToiletCreate,
	HealthToiletEdit,
	HealthToiletShow,
} from "./pages/health-toilet";
import { HealthTrendList } from "./pages/health-trend";
import { DashboardPage } from "./pages/dashboard";
import { ScheduleList } from "./pages/schedule";
import { LoginPage } from "./pages/login";
import { dataProvider } from "./providers/rest-data-provider";
import { UserContextProvider } from "./contexts/userContext";

const AppContent = () => {
	const customDataProvider = dataProvider(
		apiClient.defaults.baseURL || "",
		apiClient
	);

	return (
		<Refine
			dataProvider={customDataProvider}
			notificationProvider={useNotificationProvider}
			routerProvider={routerBindings}
			authProvider={authProvider}
			accessControlProvider={accessControlProvider}
			options={{
				syncWithLocation: true,
			}}
			resources={[
				{
					name: "dashboard",
					list: "/",
					meta: {
						label: "首頁",
						icon: <AppstoreOutlined />,
					},
				},
				{
					name: "schedule",
					list: "/schedule",
					meta: {
						label: "課表總覽",
						icon: <ScheduleOutlined />,
					},
				},
				// ── 教學管理 ──
				{
					name: "teaching",
					meta: {
						label: "教學管理",
						icon: <BookOutlined />,
					},
				},
				{
					name: "school",
					list: "/school",
					create: "/school/create",
					edit: "/school/edit/:id",
					show: "/school/:id",
					meta: {
						label: "學校管理",
						icon: <MedicineBoxOutlined />,
						parent: "teaching",
					},
				},
				{
					name: "course",
					list: "/course",
					create: "/course/create",
					edit: "/course/edit/:id",
					show: "/course/:id",
					meta: {
						label: "課程管理",
						icon: <ReadOutlined />,
						parent: "teaching",
					},
				},
				{
					name: "course-session",
					list: "/course-session",
					create: "/course-session/create",
					edit: "/course-session/edit/:id",
					show: "/course-session/:id",
					meta: {
						label: "上課記錄",
						icon: <FormOutlined />,
						parent: "teaching",
					},
				},
				// ── 學生管理 ──
				{
					name: "student-management",
					meta: {
						label: "學生管理",
						icon: <TeamOutlined />,
					},
				},
				{
					name: "student",
					list: "/student",
					create: "/student/create",
					edit: "/student/edit/:id",
					show: "/student/:id",
					meta: {
						label: "學生名冊",
						parent: "student-management",
					},
				},
				{
					name: "attendance",
					list: "/attendance",
					create: "/attendance/create",
					edit: "/attendance/edit/:id",
					show: "/attendance/:id",
					meta: {
						label: "考勤管理",
						icon: <CheckCircleOutlined />,
						parent: "student-management",
					},
				},
				{
					name: "grade-sheet",
					list: "/grade-sheet",
					create: "/grade-sheet/create",
					edit: "/grade-sheet/edit/:id",
					show: "/grade-sheet/:id",
					meta: {
						label: "成績管理",
						icon: <FileTextOutlined />,
						parent: "student-management",
					},
				},
				// ── 薪資管理 ──
				{
					name: "salary-management",
					meta: {
						label: "薪資管理",
						icon: <DollarOutlined />,
					},
				},
				{
					name: "salary-base",
					list: "/salary-base",
					create: "/salary-base/create",
					edit: "/salary-base/edit/:id",
					show: "/salary-base/:id",
					meta: {
						label: "薪資級距",
						parent: "salary-management",
					},
				},
				{
					name: "salary-overview",
					list: "/salary-overview",
					meta: {
						label: "薪資總覽",
						icon: <BarChartOutlined />,
						parent: "salary-management",
					},
				},
				// ── 健康管理 ──
				{
					name: "health",
					meta: {
						label: "健康管理",
						icon: <HeartOutlined />,
					},
				},
				{
					name: "health-weight",
					list: "/health-weight",
					create: "/health-weight/create",
					edit: "/health-weight/edit/:id",
					show: "/health-weight/:id",
					meta: {
						label: "體重管理",
						parent: "health",
					},
				},
				{
					name: "health-diet",
					list: "/health-diet",
					create: "/health-diet/create",
					edit: "/health-diet/edit/:id",
					show: "/health-diet/:id",
					meta: {
						label: "飲食紀錄",
						parent: "health",
					},
				},
				{
					name: "health-toilet",
					list: "/health-toilet",
					create: "/health-toilet/create",
					edit: "/health-toilet/edit/:id",
					show: "/health-toilet/:id",
					meta: {
						label: "如廁紀錄",
						parent: "health",
					},
				},
				{
					name: "health-trend",
					list: "/health-trend",
					meta: {
						label: "健康趨勢",
						icon: <LineChartOutlined />,
						parent: "health",
					},
				},
				// ── 系統管理 ──
				{
					name: "system",
					meta: {
						label: "系統管理",
						icon: <SettingOutlined />,
					},
				},
				{
					name: "user",
					list: "/user",
					create: "/user/create",
					edit: "/user/edit/:id",
					show: "/user/:id",
					meta: {
						label: "使用者管理",
						icon: <UserOutlined />,
						parent: "system",
					},
				},
			]}
		>
			<Routes>
				<Route
					element={
						<Authenticated
							key="authenticated-routes"
							fallback={<CatchAllNavigate to="/login" />}
						>
							<CustomLayout
								Header={CustomHeader}
								Sider={() => (
									<CustomSider
										activeItemDisabled={true}
										Title={CustomTitle}
									/>
								)}
								Title={CustomTitle}
							>
								<div
									style={{
										maxWidth: "1200px",
										marginLeft: "auto",
										marginRight: "auto",
									}}
								>
									<Outlet />
								</div>
							</CustomLayout>
						</Authenticated>
					}
				>
					<Route path="/">
						<Route index element={<DashboardPage />} />
					</Route>

					<Route path="/schedule">
						<Route index element={<ScheduleList />} />
					</Route>

					<Route path="/school">
						<Route index element={<SchoolList />} />
						<Route path="create" element={<SchoolCreate />} />
						<Route path="edit/:id" element={<SchoolEdit />} />
						<Route path=":id" element={<SchoolShow />} />
					</Route>

					<Route path="/course">
						<Route index element={<CourseList />} />
						<Route path="create" element={<CourseCreate />} />
						<Route path="edit/:id" element={<CourseEdit />} />
						<Route path=":id" element={<CourseShow />} />
					</Route>

					<Route path="/student">
						<Route index element={<StudentList />} />
						<Route path="create" element={<StudentCreate />} />
						<Route path="edit/:id" element={<StudentEdit />} />
						<Route path=":id" element={<StudentShow />} />
					</Route>

					<Route path="/attendance">
						<Route index element={<AttendanceList />} />
						<Route path="create" element={<AttendanceCreate />} />
						<Route path="edit/:id" element={<AttendanceEdit />} />
						<Route path=":id" element={<AttendanceShow />} />
					</Route>

					<Route path="/grade-sheet">
						<Route index element={<GradeSheetList />} />
						<Route path="create" element={<GradeSheetCreate />} />
						<Route path="edit/:id" element={<GradeSheetEdit />} />
						<Route path=":id" element={<GradeSheetShow />} />
					</Route>

					<Route path="/user">
						<Route index element={<UserList />} />
						<Route path="create" element={<UserCreate />} />
						<Route path="edit/:id" element={<UserEdit />} />
						<Route path=":id" element={<UserShow />} />
					</Route>

					<Route path="/salary-base">
						<Route index element={<SalaryBaseList />} />
						<Route path="create" element={<SalaryBaseCreate />} />
						<Route path="edit/:id" element={<SalaryBaseEdit />} />
						<Route path=":id" element={<SalaryBaseShow />} />
					</Route>

					<Route path="/course-session">
						<Route index element={<CourseSessionList />} />
						<Route path="create" element={<CourseSessionCreate />} />
						<Route path="edit/:id" element={<CourseSessionEdit />} />
						<Route path=":id" element={<CourseSessionShow />} />
					</Route>

					<Route path="/salary-overview">
						<Route index element={<SalaryOverviewList />} />
					</Route>

					<Route path="/health-weight">
						<Route index element={<HealthWeightList />} />
						<Route path="create" element={<HealthWeightCreate />} />
						<Route path="edit/:id" element={<HealthWeightEdit />} />
						<Route path=":id" element={<HealthWeightShow />} />
					</Route>

					<Route path="/health-diet">
						<Route index element={<HealthDietList />} />
						<Route path="create" element={<HealthDietCreate />} />
						<Route path="edit/:id" element={<HealthDietEdit />} />
						<Route path=":id" element={<HealthDietShow />} />
					</Route>

					<Route path="/health-toilet">
						<Route index element={<HealthToiletList />} />
						<Route path="create" element={<HealthToiletCreate />} />
						<Route path="edit/:id" element={<HealthToiletEdit />} />
						<Route path=":id" element={<HealthToiletShow />} />
					</Route>

					<Route path="/health-trend">
						<Route index element={<HealthTrendList />} />
					</Route>
				</Route>

				<Route
					element={
						<Authenticated key="auth-pages" fallback={<Outlet />}>
							<NavigateToResource resource="" />
						</Authenticated>
					}
				>
					<Route path="/login" element={<LoginPage />} />
				</Route>

				<Route
					element={
						<Authenticated key="catch-all">
							<CustomLayout
								Header={CustomHeader}
								Title={CustomTitle}
							>
								<Outlet />
							</CustomLayout>
						</Authenticated>
					}
				>
					<Route path="*" element={<ErrorComponent />} />
				</Route>
			</Routes>
			<RefineKbar />
			<UnsavedChangesNotifier />
			{/* <DocumentTitleHandler /> */}
		</Refine>
	);
};

const App: React.FC = () => {
	const { contextHolder } = useGlobalMessage();

	return (
		<BrowserRouter>
			<RefineKbarProvider>
				<ColorModeContextProvider>
					<UserContextProvider>
						<AntdApp>
							{contextHolder}
							<AppContent />
						</AntdApp>
					</UserContextProvider>
				</ColorModeContextProvider>
			</RefineKbarProvider>
		</BrowserRouter>
	);
};

export default App;
