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
	FrownOutlined,
	FileTextOutlined,
	SettingOutlined,
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
// import { WebsiteSettings } from './pages/website-settings';
import {
	CourseList,
	CourseCreate,
	CourseEdit,
	CourseShow,
} from "./pages/course";
// import { BlogList } from './pages/blog';
import { DashboardPage } from "./pages/dashboard";
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
					name: "school",
					list: "/school",
					create: "/school/create",
					edit: "/school/edit/:id",
					show: "/school/:id",
					meta: {
						label: "學校管理",
						icon: <MedicineBoxOutlined />,
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
						icon: <FrownOutlined />,
					},
				},
				// {
				// 	name: 'blogs',
				// 	list: '/blogs',
				// 	create: '/blogs/create',
				// 	edit: '/blogs/edit/:id',
				// 	show: '/blogs/:id',
				// 	meta: {
				// 		label: '學生管理',
				// 		icon: <FileTextOutlined />,
				// 	},
				// },
				// {
				// 	name: 'website-settings',
				// 	list: '/website-settings',
				// 	meta: {
				// 		label: '網站設置',
				// 		icon: <SettingOutlined />,
				// 	},
				// },
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

					{/* <Route path="/blog">
						<Route index element={<BlogList />} />
					</Route>

					<Route path="/website-setting">
						<Route index element={<WebsiteSettings />} />
					</Route> */}
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
