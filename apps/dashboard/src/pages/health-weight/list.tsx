import {
	List,
	useTable,
	EditButton,
	ShowButton,
	DeleteButton,
	CreateButton,
	getDefaultSortOrder,
} from "@refinedev/antd";
import { Grid, Space, Table, Dropdown, Modal, Button } from "antd";
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useGo, useNavigation, useResource, useDelete, useApiUrl, useCustomMutation, useInvalidate } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren, type Key, useState } from "react";

import { IHealthWeight } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { HealthSubjectSelector } from "../../components";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

export const HealthWeightList = ({ children }: PropsWithChildren) => {
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
							url: `${apiUrl}/${ROUTE_RESOURCE.healthWeight}/batch`,
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
								invalidate({ resource: ROUTE_RESOURCE.healthWeight, invalidates: ["list"] });
								resolve();
							},
							onError: () => reject(),
						},
					);
				}),
		});
	};

	const { tableProps, sorters, setCurrent, setPageSize } = useTable<IHealthWeight>({
		resource: ROUTE_RESOURCE.healthWeight,
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

	const records = tableProps.dataSource as IHealthWeight[];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<IHealthWeight>[] = [
		{
			label: "日期",
			dataIndex: "date",
			render: (value: string) => new Date(value).toLocaleDateString(),
		},
		{
			label: "體重",
			dataIndex: "weight",
			render: (value: number) => (value?.toFixed(2) ?? "-") + " kg",
		},
		{
			label: "身高",
			dataIndex: "height",
			render: (value: number) => value ? value.toFixed(1) + " cm" : "-",
		},
		{
			label: "BMI",
			dataIndex: "bmi",
			render: (value: number) => value ? value.toFixed(1) : "-",
		},
		{
			label: "體脂肪率",
			dataIndex: "body_fat",
			render: (value: number) => value != null ? value.toFixed(1) + " %" : "-",
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
							to: `${createUrl(ROUTE_PATH.healthWeight)}`,
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
				<MobileCardList<IHealthWeight>
					dataSource={records}
					fields={mobileFields}
					rowKey="id"
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_PATH.healthWeight, record.id)}
					onEdit={(record) => edit(ROUTE_PATH.healthWeight, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.healthWeight,
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
					dataIndex="weight"
					title="體重 (kg)"
					sorter
					render={(value: number) => value?.toFixed(2) ?? "-"}
				/>
				<Table.Column
					dataIndex="height"
					title="身高 (cm)"
					render={(value: number) =>
						value ? value.toFixed(1) : "-"
					}
				/>
				<Table.Column
					dataIndex="bmi"
					title="BMI"
					render={(value: number) =>
						value ? value.toFixed(1) : "-"
					}
				/>
				<Table.Column
					dataIndex="body_fat"
					title="體脂肪率 (%)"
					render={(value: number) =>
						value != null ? value.toFixed(1) : "-"
					}
				/>
				<Table.Column
					dataIndex="note"
					title="備註"
					render={(value: string) => value || "-"}
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
				<Table.Column<IHealthWeight>
					title="操作"
					width={isMobile ? 50 : undefined}
					render={(_: any, record: IHealthWeight) =>
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
												show(ROUTE_PATH.healthWeight, record.id),
										},
										{
											key: "edit",
											icon: <EditOutlined />,
											label: "編輯",
											onClick: () =>
												edit(ROUTE_PATH.healthWeight, record.id),
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
																resource: ROUTE_RESOURCE.healthWeight,
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
									resource={ROUTE_RESOURCE.healthWeight}
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
