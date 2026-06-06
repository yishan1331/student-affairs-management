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
import { useGo, useNavigation, useResource, useDelete, useApiUrl, useCustomMutation, useInvalidate } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren, type Key, useState } from "react";

import { IHealthDiet, MealType } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE, MEAL_TYPE_MAP } from "../../common/constants";
import { HealthSubjectSelector } from "../../components";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

export const HealthDietList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl, show, edit } = useNavigation();
	const [petId, setPetId] = useState<number | undefined>(undefined);

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
							url: `${apiUrl}/${ROUTE_RESOURCE.healthDiet}/batch`,
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
								invalidate({ resource: ROUTE_RESOURCE.healthDiet, invalidates: ["list"] });
								resolve();
							},
							onError: () => reject(),
						},
					);
				}),
		});
	};

	const { tableProps, sorters, setCurrent, setPageSize } = useTable<IHealthDiet>({
		resource: ROUTE_RESOURCE.healthDiet,
		initialSorter: [
			{
				field: "date",
				order: "desc",
			},
		],
		filters: {
			permanent: [
				{ field: "pet_id", operator: "eq", value: petId !== undefined ? petId : "null" },
			],
		},
	});

	const records = tableProps.dataSource as IHealthDiet[];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<IHealthDiet>[] = [
		{
			label: "食物名稱",
			dataIndex: "food_name",
		},
		{
			label: "日期",
			dataIndex: "date",
			render: (value: string) => new Date(value).toLocaleDateString(),
		},
		{
			label: "餐別",
			dataIndex: "meal_type",
			render: (value: MealType) => {
				const m = MEAL_TYPE_MAP[value];
				return m ? <Tag color={m.color}>{m.label}</Tag> : value;
			},
		},
		{
			label: "份量",
			dataIndex: "amount",
			render: (value: string) => value || "-",
		},
		{
			label: "卡路里",
			dataIndex: "calories",
			render: (value: number) => value != null ? value : "-",
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
							to: `${createUrl(ROUTE_PATH.healthDiet)}`,
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
			<HealthSubjectSelector value={petId} onChange={(v) => { setPetId(v); setCurrent(1); }} />
			{isMobile ? (
				<MobileCardList<IHealthDiet>
					dataSource={records}
					fields={mobileFields}
					rowKey="id"
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_PATH.healthDiet, record.id)}
					onEdit={(record) => edit(ROUTE_PATH.healthDiet, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.healthDiet,
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
				<Table.Column
					dataIndex="date"
					title="日期"
					sorter
					render={(value: string) =>
						new Date(value).toLocaleDateString()
					}
				/>
				<Table.Column
					dataIndex="meal_type"
					title="餐別"
					render={(value: MealType) => {
						const m = MEAL_TYPE_MAP[value];
						return m ? (
							<Tag color={m.color}>{m.label}</Tag>
						) : (
							value
						);
					}}
				/>
				<Table.Column dataIndex="food_name" title="食物名稱" />
				<Table.Column
					dataIndex="amount"
					title="份量"
					render={(value: string) => value || "-"}
				/>
				<Table.Column
					dataIndex="calories"
					title="卡路里"
					render={(value: number) =>
						value != null ? value : "-"
					}
				/>
				<Table.Column
					dataIndex="note"
					title="備註"
					render={(value: string) => value || "-"}
				/>
				<Table.Column<IHealthDiet>
					title="操作"
					width={isMobile ? 50 : undefined}
					render={(_: any, record: IHealthDiet) =>
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
												show(ROUTE_PATH.healthDiet, record.id),
										},
										{
											key: "edit",
											icon: <EditOutlined />,
											label: "編輯",
											onClick: () =>
												edit(ROUTE_PATH.healthDiet, record.id),
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
																resource: ROUTE_RESOURCE.healthDiet,
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
									resource={ROUTE_RESOURCE.healthDiet}
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
