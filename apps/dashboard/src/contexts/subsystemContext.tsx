import {
	createContext,
	useContext,
	ReactNode,
	useState,
	useCallback,
	useMemo,
	useEffect,
} from "react";
import { useLocation } from "react-router";
import {
	TOKEN_KEY,
	SUBSYSTEM_KEY,
	SUBSYSTEM_ORDER,
	RESOURCE_SUBSYSTEM,
	type Subsystem,
} from "../common/constants";
import { getTokenPayload } from "../providers/authProvider";

// 從 JWT 解析此帳號被授權的子系統（依固定順序排列，過濾未知值）
const readAllowedSubsystems = (): Subsystem[] => {
	const token = localStorage.getItem(TOKEN_KEY);
	if (!token) return [];
	try {
		const payload = getTokenPayload(token);
		const subs = (payload.subsystems ?? []) as Subsystem[];
		return SUBSYSTEM_ORDER.filter((s) => subs.includes(s));
	} catch {
		return [];
	}
};

// 決定初始作用中的子系統：優先沿用 localStorage（須仍在授權清單內），否則取第一個授權子系統
const resolveInitialActive = (allowed: Subsystem[]): Subsystem | null => {
	if (allowed.length === 0) return null;
	const saved = localStorage.getItem(SUBSYSTEM_KEY) as Subsystem | null;
	if (saved && allowed.includes(saved)) return saved;
	return allowed[0];
};

interface SubsystemContextType {
	allowedSubsystems: Subsystem[];
	activeSubsystem: Subsystem | null;
	setActiveSubsystem: (s: Subsystem) => void;
}

const SubsystemContext = createContext<SubsystemContextType | undefined>(
	undefined,
);

export const SubsystemContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const initialAllowed = useMemo(() => readAllowedSubsystems(), []);
	// 以 state 保存授權子系統，使 token 背景刷新後（admin 調整權限）能在下次導覽時更新選單與切換器
	const [allowedSubsystems, setAllowedSubsystems] =
		useState<Subsystem[]>(initialAllowed);
	const [activeSubsystem, setActiveState] = useState<Subsystem | null>(() =>
		resolveInitialActive(initialAllowed),
	);

	const setActiveSubsystem = useCallback((s: Subsystem) => {
		localStorage.setItem(SUBSYSTEM_KEY, s);
		setActiveState(s);
	}, []);

	const location = useLocation();
	useEffect(() => {
		// 每次導覽重讀 token 的授權子系統，若有變動則更新（涵蓋背景刷新後權限改變）
		const allowed = readAllowedSubsystems();
		if (allowed.join(",") !== allowedSubsystems.join(",")) {
			setAllowedSubsystems(allowed);
		}

		// 深連同步：進入某個「已授權」子系統的頁面時，把作用中子系統切過去，
		// 讓側邊選單與切換器與目前頁面一致（書籤、重新整理、跨子系統連結皆適用）。
		// 無權子系統的頁面由 SubsystemRouteGuard 於 render 階段重導，此處不處理。
		const segment = location.pathname.split("/")[1] || "dashboard";
		const routeSub = RESOURCE_SUBSYSTEM[segment];
		if (
			routeSub &&
			allowed.includes(routeSub) &&
			routeSub !== activeSubsystem
		) {
			setActiveSubsystem(routeSub);
		}
	}, [location.pathname, allowedSubsystems, activeSubsystem, setActiveSubsystem]);

	return (
		<SubsystemContext.Provider
			value={{ allowedSubsystems, activeSubsystem, setActiveSubsystem }}
		>
			{children}
		</SubsystemContext.Provider>
	);
};

export const useSubsystem = () => {
	const ctx = useContext(SubsystemContext);
	if (ctx === undefined) {
		throw new Error(
			"useSubsystem must be used within a SubsystemContextProvider",
		);
	}
	return ctx;
};
