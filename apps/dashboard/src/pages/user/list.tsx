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
import {
	useGo,
	useNavigation,
	useResource,
	useDelete,
	useApiUrl,
	useCustomMutation,
	useInvalidate,
} from "@refinedev/core";
import { useLocation } from "react-router";
import { useState, type Key, type PropsWithChildren } from "react";

import { IUser } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

const roleMap: Record<string, { label: string; color: string }> = {
	admin: { label: "管理員", color: "red" },
	user: { label: "使用者", color: "blue" },
	guest: { label: "訪客", color: "green" },
};

export const UserList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl, show, edit } = useNavigation();

	const { resource } = useResource();
	const { mutate: deleteRecord } = useDelete();

	const apiUrl = useApiUrl();
	const invalidate = useInvalidate();
	const { mutate: batchDelete, isLoading: isBatchDeleting } = useCustomMutation();
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

	const handleBatchDelete = () => {
		if (selectedRowKeys.length === 0) return;
		Modal.confirm({
			title: `確認要刪除選取的 ${selectedRowKeys.length} 筆紀錄嗎？`,
			okText: "確認",
			cancelText: "取消",
			okType: "danger",
			onOk: () =>
				new Promise<void>((resolve, reject) => {
					batchDelete(
						{
							url: `${apiUrl}/${ROUTE_RESOURCE.user}/batch`,
							method: "delete",
							values: { ids: selectedRowKeys },
							successNotification: {
								message: "批次刪除成功",
								description: `已成功刪除 ${selectedRowKeys.length} 筆資料`,
								type: "success",
							},
							errorNotification: {
								message: "批次刪除失敗",
								description: "無法刪除選取的資料",
								type: "error",
							},
						},
						{
							onSuccess: () => {
								setSelectedRowKeys([]);
								invalidate({ resource: ROUTE_RESOURCE.user, invalidates: ["list"] });
								resolve();
							},
							onError: () => reject(),
						},
					);
				}),
		});
	};

	const { tableProps, sorters, setCurrent, setPageSize } = useTable<IUser>({
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

	const mobileFields: MobileCardField<IUser>[] = [
		{ label: "帳號", dataIndex: "account" },
		{ label: "使用者名稱", dataIndex: "username" },
		{
			label: "角色",
			dataIndex: "role",
			render: (value: string) => {
				const r = roleMap[value];
				return r ? <Tag color={r.color}>{r.label}</Tag> : value;
			},
		},
		{
			label: "狀態",
			dataIndex: "status",
			render: (value: string) => (
				<Tag color={value === "active" ? "success" : "error"}>
					{value === "active" ? "啟用" : "停用"}
				</Tag>
			),
		},
	];

	const mobilePagination = isMobile ? {
		current: (tableProps.pagination as any)?.current,
		pageSize: (tableProps.pagination as any)?.pageSize,
		total: (tableProps.pagination as any)?.total,
		onChange: (page: number, size: number) => {
			setCurrent(page);
			setPageSize(size);
		},
	} : undefined;

	return (
		<List
			breadcrumb={true}
			headerButtons={[
				...(!isMobile && selectedRowKeys.length > 0
					? [
							<Button
								key="batch-delete"
								danger
								icon={<DeleteOutlined />}
								loading={isBatchDeleting}
								onClick={handleBatchDelete}
							>
								批次刪除 ({selectedRowKeys.length})
							</Button>,
						]
					: []),
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
			{isMobile ? (
				<MobileCardList<IUser>
					dataSource={records}
					fields={mobileFields}
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_PATH.user, record.id)}
					onEdit={(record) => edit(ROUTE_PATH.user, record.id)}
					onDelete={(record) => {
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
					}}
				/>
			) : (
				<Table
					{...tableProps}
					dataSource={records}
					rowKey="id"
					scroll={{ x: 'max-content' }}
					rowSelection={{
						selectedRowKeys,
						onChange: setSelectedRowKeys,
						preserveSelectedRowKeys: true,
					}}
				>
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
												onClick: () => show(ROUTE_PATH.user, record.id),
											},
											{
												key: "edit",
												icon: <EditOutlined />,
												label: "編輯",
												onClick: () => edit(ROUTE_PATH.user, record.id),
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
			)}
			{children}
		</List>
	);
};
