import React from "react";
import { Navigate, useLocation } from "react-router";

import { useSubsystem } from "../../contexts/subsystemContext";
import { RESOURCE_SUBSYSTEM, SUBSYSTEM_CONFIG } from "../../common/constants";

/**
 * 路由層子系統守衛：直接以網址進入「無權」子系統的頁面時，在頁面 mount 前即重導至
 * 該帳號第一個有權子系統的落地頁，避免無權頁面送出 API 而觸發 403 錯誤提示。
 * 共用頁面（不在 RESOURCE_SUBSYSTEM）與已授權子系統頁面一律放行。
 */
export const SubsystemRouteGuard: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { allowedSubsystems } = useSubsystem();
	const location = useLocation();

	const segment = location.pathname.split("/")[1] || "dashboard";
	const routeSub = RESOURCE_SUBSYSTEM[segment];

	if (
		routeSub &&
		allowedSubsystems.length > 0 &&
		!allowedSubsystems.includes(routeSub)
	) {
		return (
			<Navigate
				to={SUBSYSTEM_CONFIG[allowedSubsystems[0]].defaultPath}
				replace
			/>
		);
	}

	return <>{children}</>;
};
