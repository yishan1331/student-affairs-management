import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import routerBindings from "@refinedev/react-router";
import { useGetToPath, useResource, type IResourceItem } from "@refinedev/core";

const LOCATION_HISTORY_KEY = "refine-location-history";
const HISTORY_LIMIT = 30;

const readHistory = (): string[] => {
	try {
		const raw = sessionStorage.getItem(LOCATION_HISTORY_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
};

/**
 * 走訪網址歷史追蹤器：掛在 <Refine> 內，隨路由變化把目前完整網址（pathname + 含
 * current / pageSize / filters / sorters 的 query）寫入 sessionStorage。
 *
 * 只依賴 useLocation（在任何路由情境下皆可靠），供返回箭頭往回尋找使用者離開的列表頁，
 * 還原其分頁與篩選狀態，而非跳回列表第一頁。
 */
export const ListLocationTracker = () => {
	const { pathname, search } = useLocation();

	useEffect(() => {
		const current = `${pathname}${search}`;
		const history = readHistory();
		// 同一網址連續出現時不重複堆疊
		if (history[history.length - 1] !== current) {
			history.push(current);
			sessionStorage.setItem(
				LOCATION_HISTORY_KEY,
				JSON.stringify(history.slice(-HISTORY_LIMIT)),
			);
		}
	}, [pathname, search]);

	return null;
};

/**
 * 自訂 routerProvider：覆寫 Refine CRUD 頁面（Create/Edit/Show）標題列的返回箭頭行為。
 *
 * Refine 內建的返回按鈕固定呼叫 `navigate(-1)`（瀏覽器歷史返回），導致從不同入口
 * 進入新增/編輯頁時，按上一頁會跳回上一個瀏覽過的頁面，而非該功能的查詢（列表）頁。
 *
 * 這裡將 `back` 改為 resource-aware：在 create / edit / clone / show 頁時，往走訪歷史
 * 回找「該資源列表頁」最近一次的完整網址（含分頁/篩選/排序）並導回；若歷史中找不到，
 * 則退回該資源列表頁的基底路徑；其餘情況維持原本的瀏覽器返回行為。
 */
export const routerProvider = {
	...routerBindings,
	back: () => {
		const navigate = useNavigate();
		const getToPath = useGetToPath();
		const { resource, action } = useResource();

		return useCallback(() => {
			const isCrudDetailAction =
				action === "create" ||
				action === "edit" ||
				action === "clone" ||
				action === "show";

			if (resource && isCrudDetailAction) {
				const listPath = getToPath({
					resource: resource as IResourceItem,
					action: "list",
				});

				if (listPath) {
					// 從走訪歷史往回找該列表頁最近一次的完整網址（保留分頁/篩選/排序）
					const history = readHistory();
					for (let i = history.length - 1; i >= 0; i--) {
						const entry = history[i];
						if (entry.split("?")[0] === listPath) {
							navigate(entry);
							return;
						}
					}

					navigate(listPath);
					return;
				}
			}

			navigate(-1);
		}, [navigate, getToPath, resource, action]);
	},
};

export default routerProvider;
