import {
	List,
	useTable,
	EditButton,
	ShowButton,
	DeleteButton,
	CreateButton,
	getDefaultSortOrder,
} from "@refinedev/antd";
import { Grid, Space, Table, Tag, Dropdown, Modal, Button } from "antd";
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGo, useNavigation, useResource, useDelete } from "@refinedev/core";
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
	const { createUrl, show, edit } = useNavigation();

	const { resource } = useResource();
	const { mutate: deleteRecord } = useDelete();

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

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

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
			<Table {...tableProps} dataSource={records} rowKey="id" scroll={{ x: 'max-content' }}>
				{!isMobile && (
					<Table.Column
						dataIndex="id"
						title="ID"
						defaultSortOrder={getDefaultSortOrder("id", sorters)}
					/>
				)}
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
				{!isMobile && (
					<Table.Column
						dataIndex="created_at"
						title="建立時間"
						render={(value: string) =>
							new Date(value).toLocaleString()
						}
					/>
				)}
				{!isMobile && (
					<Table.Column
						dataIndex="updated_at"
						title="更新時間"
						render={(value: string) =>
							new Date(value).toLocaleString()
						}
					/>
				)}
				<Table.Column<IUser>
					title="操作"
					width={isMobile ? 50 : undefined}
					render={(_: any, record: IUser) =>
						isMobile ? (
							<Dropdown
								trigger={["click"]}
								menu={{
									items: [
										{
											key: "show",
											icon: <EyeOutlined />,
											label: "查看",
											onClick: () => show(ROUTE_RESOURCE.user, record.id),
										},
										{
											key: "edit",
											icon: <EditOutlined />,
											label: "編輯",
											onClick: () => edit(ROUTE_RESOURCE.user, record.id),
										},
										{ type: "divider" },
										{
											key: "delete",
											icon: <DeleteOutlined />,
											label: "刪除",
											danger: true,
											onClick: () => {
												Modal.confirm({
													title: "確認要刪除嗎？",
													okText: "確認",
													cancelText: "取消",
													okType: "danger",
													onOk: () => {
														deleteRecord({
															resource: ROUTE_RESOURCE.user,
															id: record.id,
															successNotification: {
																message: "刪除成功",
																description: `${resource?.meta?.label}已成功刪除`,
																type: "success",
															},
															errorNotification: {
																message: "刪除失敗",
																description: `無法刪除${resource?.meta?.label}`,
																type: "error",
															},
														});
													},
												});
											},
										},
									],
								}}
							>
								<Button type="text" icon={<MoreOutlined />} size="small" />
							</Dropdown>
						) : (
							<Space>
								<ShowButton
									hideText
									size="middle"
									recordItemId={record.id}
								/>
								<EditButton
									hideText
									size="middle"
									recordItemId={record.id}
								/>
								<DeleteButton
									resource={ROUTE_RESOURCE.user}
									hideText
									size="middle"
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
						)
					}
				/>
			</Table>
			{children}
		</List>
	);
};
