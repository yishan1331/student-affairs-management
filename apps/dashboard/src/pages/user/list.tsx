import {
	List,
	useTable,
	EditButton,
	ShowButton,
	DeleteButton,
	CreateButton,
	getDefaultSortOrder,
} from "@refinedev/antd";
import { Space, Table, Tag } from "antd";
import { useGo, useNavigation, useResource } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren } from "react";

import { IUser } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";

const roleMap: Record<string, { label: string; color: string }> = {
	admin: { label: "管理員", color: "red" },
	manager: { label: "經理", color: "blue" },
	staff: { label: "職員", color: "green" },
};

export const UserList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<IUser>({
		resource: ROUTE_RESOURCE.user,
		initialSorter: [
			{
				field: "updated_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as IUser[];

	return (
		<List
			breadcrumb={true}
			headerButtons={[
				<CreateButton
					key="create"
					hideText={false}
					size="middle"
					style={{ marginLeft: 8 }}
					onClick={() => {
						return go({
							to: `${createUrl(ROUTE_PATH.user)}`,
							query: {
								to: pathname,
							},
							options: {
								keepQuery: true,
							},
							type: "replace",
						});
					}}
				>
					新增資料
				</CreateButton>,
			]}
		>
			<Table {...tableProps} dataSource={records} rowKey="id">
				<Table.Column
					dataIndex="id"
					title="ID"
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
				<Table.Column dataIndex="account" title="帳號" />
				<Table.Column dataIndex="username" title="使用者名稱" />
				<Table.Column
					dataIndex="role"
					title="角色"
					render={(value: string) => {
						const r = roleMap[value];
						return r ? (
							<Tag color={r.color}>{r.label}</Tag>
						) : (
							value
						);
					}}
				/>
				<Table.Column dataIndex="email" title="信箱" />
				<Table.Column
					dataIndex="status"
					title="狀態"
					render={(value: string) => (
						<Tag color={value === "active" ? "success" : "error"}>
							{value === "active" ? "啟用" : "停用"}
						</Tag>
					)}
				/>
				<Table.Column
					dataIndex="created_at"
					title="建立時間"
					render={(value: string) =>
						new Date(value).toLocaleString()
					}
				/>
				<Table.Column
					dataIndex="updated_at"
					title="更新時間"
					render={(value: string) =>
						new Date(value).toLocaleString()
					}
				/>
				<Table.Column<IUser>
					title="操作"
					render={(_: any, record: IUser) => (
						<Space>
							<ShowButton
								hideText
								size="small"
								recordItemId={record.id}
							/>
							<EditButton
								hideText
								size="small"
								recordItemId={record.id}
							/>
							<DeleteButton
								resource={ROUTE_RESOURCE.user}
								hideText
								size="small"
								recordItemId={record.id}
								confirmTitle={`確認要刪除嗎？`}
								confirmOkText={`確認`}
								confirmCancelText={`取消`}
								successNotification={{
									message: "刪除成功",
									description: `${resource?.meta?.label}已成功刪除`,
									type: "success",
								}}
								errorNotification={{
									message: "刪除失敗",
									description: `無法刪除${resource?.meta?.label}`,
									type: "error",
								}}
							/>
						</Space>
					)}
				/>
			</Table>
			{children}
		</List>
	);
};
