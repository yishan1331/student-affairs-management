import React from "react";
import { Grid, theme } from "antd";
import {
	AppstoreOutlined,
	ScheduleOutlined,
	FormOutlined,
	TeamOutlined,
	DashboardOutlined,
	CoffeeOutlined,
	MedicineBoxOutlined,
	LineChartOutlined,
} from "@ant-design/icons";
import { useLink, useRouterType, useRouterContext } from "@refinedev/core";
import { useLocation } from "react-router";

import { useSubsystem } from "../../contexts/subsystemContext";
import type { Subsystem } from "../../common/constants";

interface NavItem {
	key: string;
	label: string;
	icon: React.ReactNode;
	path: string;
}

// 各子系統的手機底部快速導覽項目
const NAV_ITEMS_BY_SUBSYSTEM: Record<Subsystem, NavItem[]> = {
	course: [
		{ key: "dashboard", label: "首頁", icon: <AppstoreOutlined />, path: "/" },
		{ key: "schedule", label: "課表", icon: <ScheduleOutlined />, path: "/schedule" },
		{ key: "course-session", label: "上課", icon: <FormOutlined />, path: "/course-session" },
		{ key: "student", label: "學生", icon: <TeamOutlined />, path: "/student" },
	],
	health: [
		{ key: "health-weight", label: "體重", icon: <DashboardOutlined />, path: "/health-weight" },
		{ key: "health-diet", label: "飲食", icon: <CoffeeOutlined />, path: "/health-diet" },
		{ key: "health-symptom", label: "症狀", icon: <MedicineBoxOutlined />, path: "/health-symptom" },
		{ key: "health-trend", label: "趨勢", icon: <LineChartOutlined />, path: "/health-trend" },
	],
};

export const BottomNav: React.FC = () => {
	const { token } = theme.useToken();
	const breakpoint = Grid.useBreakpoint();
	const isMobile =
		typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;
	const routerType = useRouterType();
	const NewLink = useLink();
	const { Link: LegacyLink } = useRouterContext();
	const Link = routerType === "legacy" ? LegacyLink : NewLink;
	const { pathname } = useLocation();
	const { activeSubsystem } = useSubsystem();

	if (!isMobile) return null;

	// 依作用中子系統決定導覽項目；無作用中子系統時不顯示
	const navItems = activeSubsystem
		? NAV_ITEMS_BY_SUBSYSTEM[activeSubsystem]
		: [];
	if (navItems.length === 0) return null;

	const isActive = (path: string) => {
		if (path === "/") return pathname === "/";
		return pathname.startsWith(path);
	};

	return (
		<div
			style={{
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				height: 56,
				backgroundColor: token.colorBgElevated,
				borderTop: `1px solid ${token.colorBorderSecondary}`,
				display: "flex",
				justifyContent: "space-around",
				alignItems: "center",
				zIndex: 1000,
				paddingBottom: "env(safe-area-inset-bottom, 0px)",
			}}
		>
			{navItems.map((item) => {
				const active = isActive(item.path);
				return (
					<Link
						key={item.key}
						to={item.path}
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							justifyContent: "center",
							flex: 1,
							height: "100%",
							textDecoration: "none",
							color: active
								? token.colorPrimary
								: token.colorTextSecondary,
							fontSize: 10,
							gap: 2,
							WebkitTapHighlightColor: "transparent",
						}}
					>
						<span style={{ fontSize: 20 }}>{item.icon}</span>
						<span>{item.label}</span>
					</Link>
				);
			})}
		</div>
	);
};
