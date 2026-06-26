import React from "react";
import { Segmented, Grid } from "antd";
import { BookOutlined, HeartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

import { useSubsystem } from "../../contexts/subsystemContext";
import {
	SUBSYSTEM_CONFIG,
	type Subsystem,
} from "../../common/constants";

const SUBSYSTEM_ICON: Record<Subsystem, React.ReactNode> = {
	course: <BookOutlined />,
	health: <HeartOutlined />,
};

export const SubsystemSwitcher: React.FC = () => {
	const { allowedSubsystems, activeSubsystem, setActiveSubsystem } =
		useSubsystem();
	const navigate = useNavigate();
	const breakpoint = Grid.useBreakpoint();
	const isMobile =
		typeof breakpoint.lg === "undefined" ? false : !breakpoint.lg;

	// 僅授權單一（或零個）子系統時，毋須顯示切換器
	if (allowedSubsystems.length < 2 || !activeSubsystem) return null;

	const options = allowedSubsystems.map((s) => ({
		label: isMobile ? undefined : SUBSYSTEM_CONFIG[s].label,
		value: s,
		icon: SUBSYSTEM_ICON[s],
	}));

	return (
		<Segmented
			value={activeSubsystem}
			options={options}
			onChange={(value) => {
				const next = value as Subsystem;
				setActiveSubsystem(next);
				// 切換後導向該子系統預設落地頁，避免停留在另一子系統的頁面
				navigate(SUBSYSTEM_CONFIG[next].defaultPath);
			}}
		/>
	);
};
