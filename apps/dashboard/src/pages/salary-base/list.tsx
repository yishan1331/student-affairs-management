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

import { ISalaryBase } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

export const SalaryBaseList = ({ children }: PropsWithChildren) => {
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
							url: `${apiUrl}/${ROUTE_RESOURCE.salaryBase}/batch`,
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
								invalidate({ resource: ROUTE_RESOURCE.salaryBase, invalidates: ["list"] });
								resolve();
							},
							onError: () => reject(),
						},
					);
				}),
		});
	};

	const { tableProps, sorters, setCurrent, setPageSize } = useTable<ISalaryBase>({
		resource: ROUTE_RESOURCE.salaryBase,
		initialSorter: [
			{
				field: "updated_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as ISalaryBase[];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<ISalaryBase>[] = [
		{
			label: "名稱",
			dataIndex: "name",
		},
		{
			label: "時薪",
			dataIndex: "hourly_rate",
			render: (value: number) => `$${value}`,
		},
		{
			label: "人數範圍",
			render: (_: any, record: ISalaryBase) => {
				if (record.min_students == null && record.max_students == null) return "固定薪資";
				const min = record.min_students ?? 0;
				const max = record.max_students;
				if (max == null) return `${min}人以上`;
				return `${min}~${max}人`;
			},
		},
		{
			label: "啟用狀態",
			dataIndex: "is_active",
			render: (value: boolean) => (
				<Tag color={value ? "success" : "error"}>
					{value ? "啟用" : "未啟用"}
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
							to: `${createUrl(ROUTE_PATH.salaryBase)}`,
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
				<MobileCardList<ISalaryBase>
					dataSource={records}
					fields={mobileFields}
					rowKey="id"
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_PATH.salaryBase, record.id)}
					onEdit={(record) => edit(ROUTE_PATH.salaryBase, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.salaryBase,
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
				<Table.Column dataIndex="name" title="名稱" />
				<Table.Column<ISalaryBase>
					title="適用學校"
					render={(_: any, record: ISalaryBase) => {
						if (!record.schools?.length) return "-";
						return (
							<Space size={[0, 4]} wrap>
								{record.schools.map((school) => (
									<Tag key={school.id} color="blue">
										{school.name}
									</Tag>
								))}
							</Space>
						);
					}}
				/>
				<Table.Column<ISalaryBase>
					title="適用課程"
					render={(_: any, record: ISalaryBase) => {
						if (!record.courses?.length) return "-";
						return (
							<Space size={[0, 4]} wrap>
								{record.courses.map((course) => (
									<Tag key={course.id} color="purple">
										{course.name}
									</Tag>
								))}
							</Space>
						);
					}}
				/>
				<Table.Column
					dataIndex="hourly_rate"
					title="時薪"
					render={(value: number) => `$${value}`}
				/>
				<Table.Column<ISalaryBase>
					title="人數範圍"
					render={(_: any, record: ISalaryBase) => {
						if (record.min_students == null && record.max_students == null) {
							return "固定薪資";
						}
						const min = record.min_students ?? 0;
						const max = record.max_students;
						if (max == null) return `${min}人以上`;
						return `${min}~${max}人`;
					}}
				/>
				{!isMobile && (
					<Table.Column dataIndex="description" title="描述" />
				)}
				<Table.Column
					dataIndex="is_active"
					title="啟用狀態"
					render={(value: boolean) => (
						<Tag color={value ? "success" : "error"}>
							{value ? "啟用" : "未啟用"}
						</Tag>
					)}
				/>
				{!isMobile && (
					<Table.Column
						dataIndex="created_at"
						title="建立時間"
						render={(value: string) => new Date(value).toLocaleString()}
					/>
				)}
				{!isMobile && (
					<Table.Column
						dataIndex="updated_at"
						title="更新時間"
						render={(value: string) => new Date(value).toLocaleString()}
					/>
				)}
				<Table.Column<ISalaryBase>
					title="操作"
					width={isMobile ? 50 : undefined}
					render={(_: any, record: ISalaryBase) =>
						isMobile ? (
							<Dropdown
								trigger={["click"]}
								menu={{
									items: [
										{
											key: "show",
											icon: <EyeOutlined />,
											label: "查看",
											onClick: () =>
												show(ROUTE_PATH.salaryBase, record.id),
										},
										{
											key: "edit",
											icon: <EditOutlined />,
											label: "編輯",
											onClick: () =>
												edit(ROUTE_PATH.salaryBase, record.id),
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
														deleteRecord(
															{
																resource: ROUTE_RESOURCE.salaryBase,
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
															},
														);
													},
												});
											},
										},
									],
								}}
							>
								<Button
									type="text"
									icon={<MoreOutlined />}
									size="small"
								/>
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
									resource={ROUTE_RESOURCE.salaryBase}
									hideText
									size="middle"
									recordItemId={record.id}
									confirmTitle="確認要刪除嗎？"
									confirmOkText="確認"
									confirmCancelText="取消"
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
