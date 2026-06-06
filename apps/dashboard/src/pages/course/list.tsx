import {
	List,
	useTable,
	EditButton,
	ShowButton,
	DeleteButton,
	CreateButton,
	getDefaultSortOrder,
	useSelect,
} from "@refinedev/antd";
import { Grid, Space, Table, Typography, Dropdown, Modal, Button } from "antd";
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
import dayjs from "dayjs";

import { ISchool } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { ICourse } from "../../common/types/models/course.types";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

const DAY_MAP: Record<string, string> = {
	"1": "週一",
	"2": "週二",
	"3": "週三",
	"4": "週四",
	"5": "週五",
	"6": "週六",
	"7": "週日",
};

export const CourseList = ({ children }: PropsWithChildren) => {
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
							url: `${apiUrl}/${ROUTE_RESOURCE.course}/batch`,
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
								invalidate({ resource: ROUTE_RESOURCE.course, invalidates: ["list"] });
								resolve();
							},
							onError: () => reject(),
						},
					);
				}),
		});
	};

	const { tableProps, sorters, searchFormProps, tableQuery, setCurrent, setPageSize } =
		useTable<ICourse>({
			resource: ROUTE_RESOURCE.course,
			initialSorter: [
				{
					field: "updated_at",
					order: "desc",
				},
			],
		});

	const records = tableProps.dataSource as ICourse[];

	const { selectProps: categorySelectProps, query: queryResult } =
		useSelect<ISchool>({
			resource: ROUTE_RESOURCE.school,
			filters: [{ field: "is_active", operator: "eq", value: true }],
		});
	const medicalCategories = queryResult?.data?.data || [];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<ICourse>[] = [
		{ label: "名稱", dataIndex: "name" },
		{ label: "學校", render: (_, record) => record.school?.name || "-" },
		{ label: "年級", dataIndex: "grade" },
		{
			label: "上課星期",
			dataIndex: "day_of_week",
			render: (value: string) =>
				value
					?.split(",")
					.map((d: string) => DAY_MAP[d.trim()] || d.trim())
					.join("、") || "-",
		},
		{
			label: "開始時間",
			dataIndex: "start_time",
			render: (value: string) => (value ? dayjs(value).format("HH:mm") : "-"),
		},
		{
			label: "結束時間",
			dataIndex: "end_time",
			render: (value: string) => (value ? dayjs(value).format("HH:mm") : "-"),
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
							to: `${createUrl(ROUTE_PATH.course)}`,
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
			{/* <Card title="篩選">
				<Form {...searchFormProps} layout="vertical">
					<Row gutter={[16, 16]}>
						<Col xs={24} sm={12} md={8} lg={6}>
							<Form.Item name="name">
								<Input placeholder="輸入名稱搜尋" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={12} md={8} lg={6}>
							<Form.Item>
								<Button type="primary" htmlType="submit">
									搜尋
								</Button>
								<Button
									style={{ marginLeft: 8 }}
									onClick={() =>
										searchFormProps.form?.resetFields()
									}
								>
									重置
								</Button>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Card> */}

			{isMobile ? (
				<MobileCardList<ICourse>
					dataSource={records}
					fields={mobileFields}
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_PATH.course, record.id)}
					onEdit={(record) => edit(ROUTE_PATH.course, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.course,
							id: record.id,
							successNotification: { message: "刪除成功", description: `${resource?.meta?.label?.slice(0, 2)}資料已成功刪除`, type: "success" },
							errorNotification: { message: "刪除失敗", description: `無法刪除${resource?.meta?.label?.slice(0, 2)}資料`, type: "error" },
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
				<Table.Column<ICourse>
					title="學校"
					render={(_: any, record: ICourse) =>
						record.school?.name || "-"
					}
				/>
				<Table.Column dataIndex="grade" title="年級" />
				<Table.Column
					dataIndex="day_of_week"
					title="上課星期"
					render={(value: string) =>
						value
							?.split(",")
							.map((d: string) => DAY_MAP[d.trim()] || d.trim())
							.join("、") || "-"
					}
				/>
				<Table.Column
					dataIndex="start_time"
					title="開始時間"
					render={(value: string) =>
						value ? dayjs(value).format("HH:mm") : "-"
					}
				/>
				<Table.Column
					dataIndex="end_time"
					title="結束時間"
					render={(value: string) =>
						value ? dayjs(value).format("HH:mm") : "-"
					}
				/>
				{!isMobile && (
					<Table.Column
						dataIndex="duration"
						title="時長"
						render={(value: number) =>
							value ? `${value} 分鐘` : "-"
						}
					/>
				)}
				{!isMobile && (
					<Table.Column
						dataIndex="updated_at"
						title="更新時間"
						render={(value: string) => new Date(value).toLocaleString()}
					/>
				)}
				<Table.Column<ICourse>
					title="操作"
					width={isMobile ? 50 : undefined}
					render={(_: any, record: ICourse) =>
						isMobile ? (
							<Dropdown
								trigger={["click"]}
								menu={{
									items: [
										{
											key: "show",
											icon: <EyeOutlined />,
											label: "查看",
											onClick: () => show(ROUTE_PATH.course, record.id),
										},
										{
											key: "edit",
											icon: <EditOutlined />,
											label: "編輯",
											onClick: () => edit(ROUTE_PATH.course, record.id),
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
															resource: ROUTE_RESOURCE.course,
															id: record.id,
															successNotification: {
																message: "刪除成功",
																description: `${resource?.meta?.label?.slice(0, 2)}資料已成功刪除`,
																type: "success",
															},
															errorNotification: {
																message: "刪除失敗",
																description: `無法刪除${resource?.meta?.label?.slice(0, 2)}資料`,
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
								<ShowButton hideText size="middle" recordItemId={record.id} />
								<EditButton hideText size="middle" recordItemId={record.id} />
								<DeleteButton
									resource={ROUTE_RESOURCE.course}
									hideText
									size="middle"
									recordItemId={record.id}
									confirmTitle="確認要刪除嗎？"
									confirmOkText="確認"
									confirmCancelText="取消"
									successNotification={{
										message: "刪除成功",
										description: `${resource?.meta?.label?.slice(0, 2)}資料已成功刪除`,
										type: "success",
									}}
									errorNotification={{
										message: "刪除失敗",
										description: `無法刪除${resource?.meta?.label?.slice(0, 2)}資料`,
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
