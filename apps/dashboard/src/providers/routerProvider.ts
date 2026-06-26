import { useCallback } from "react";
import { useNavigate } from "react-router";
import routerBindings from "@refinedev/react-router";
import { useGetToPath, useResource, type IResourceItem } from "@refinedev/core";

/**
 * 自訂 routerProvider：覆寫 Refine CRUD 頁面（Create/Edit/Show）標題列的返回箭頭行為。
 *
 * Refine 內建的返回按鈕固定呼叫 `navigate(-1)`（瀏覽器歷史返回），導致從不同入口
 * 進入新增/編輯頁時，按上一頁會跳回上一個瀏覽過的頁面，而非該功能的查詢（列表）頁。
 *
 * 這裡將 `back` 改為 resource-aware：在 create / edit / clone / show 頁時，導向「當前
 * 資源的列表頁」；其餘情況維持原本的瀏覽器返回行為。
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
					navigate(listPath);
					return;
				}
			}

			navigate(-1);
		}, [navigate, getToPath, resource, action]);
	},
};

export default routerProvider;
