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

import { ISchool } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

export const SchoolList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl, show, edit } = useNavigation();

	const { resource } = useResource();
	const { mutate: deleteRecord } = useDelete();

	const { tableProps, sorters, searchFormProps, tableQuery } =
		useTable<ISchool>({
			resource: ROUTE_RESOURCE.school,
			initialSorter: [
				{
					field: "updated_at",
					order: "desc",
				},
			],
		});

	const records = tableProps.dataSource as ISchool[];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<ISchool>[] = [
		{ label: "名稱", dataIndex: "name" },
		{
			label: "代表顏色",
			dataIndex: "color",
			render: (value: string) =>
				value ? (
					<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
						<div
							style={{
								width: 20,
								height: 20,
								borderRadius: 4,
								backgroundColor: value,
								border: "1px solid #d9d9d9",
							}}
						/>
						<span style={{ fontSize: 12, color: "#8c8c8c" }}>{value}</span>
					</div>
				) : (
					<span style={{ color: "#bfbfbf" }}>未設定</span>
				),
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
		{
			label: "描述",
			dataIndex: "description",
			render: (value: string) => value || "-",
		},
	];

	const mobilePagination = isMobile ? {
		current: (tableProps.pagination as any)?.current,
		pageSize: (tableProps.pagination as any)?.pageSize,
		total: (tableProps.pagination as any)?.total,
		onChange: (tableProps.pagination as any)?.onChange,
	} : undefined;

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
							to: `${createUrl(ROUTE_PATH.school)}`,
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
				<MobileCardList<ISchool>
					dataSource={records}
					fields={mobileFields}
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_RESOURCE.school, record.id)}
					onEdit={(record) => edit(ROUTE_RESOURCE.school, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.school,
							id: record.id,
							successNotification: { message: "刪除成功", description: `${resource?.meta?.label}已成功刪除`, type: "success" },
							errorNotification: { message: "刪除失敗", description: `無法刪除${resource?.meta?.label}`, type: "error" },
						});
					}}
				/>
			) : (
				<Table {...tableProps} dataSource={records} rowKey="id" scroll={{ x: 'max-content' }}>
					<Table.Column
						dataIndex="id"
						title="ID"
						defaultSortOrder={getDefaultSortOrder("id", sorters)}
					/>
					<Table.Column dataIndex="name" title="名稱" />
					<Table.Column
						dataIndex="color"
						title="代表顏色"
						render={(value: string) =>
							value ? (
								<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
									<div
										style={{
											width: 20,
											height: 20,
											borderRadius: 4,
											backgroundColor: value,
											border: "1px solid #d9d9d9",
										}}
									/>
									<span style={{ fontSize: 12, color: "#8c8c8c" }}>{value}</span>
								</div>
							) : (
								<span style={{ color: "#bfbfbf" }}>未設定</span>
							)
						}
					/>
					<Table.Column dataIndex="description" title="描述" />
					<Table.Column dataIndex="display_order" title="排序" />
					<Table.Column
						dataIndex="is_active"
						title="啟用狀態"
						render={(value: boolean) => (
							<Tag color={value ? "success" : "error"}>
								{value ? "啟用" : "未啟用"}
							</Tag>
						)}
					/>
					<Table.Column dataIndex="modifier_id" title="修改者ID" />
					<Table.Column
						dataIndex="created_at"
						title="建立時間"
						render={(value: string) => new Date(value).toLocaleString()}
					/>
					<Table.Column
						dataIndex="updated_at"
						title="更新時間"
						render={(value: string) => new Date(value).toLocaleString()}
					/>
					<Table.Column<ISchool>
						title="操作"
						render={(_: any, record: ISchool) => (
							<Space>
								<ShowButton hideText size="middle" recordItemId={record.id} />
								<EditButton hideText size="middle" recordItemId={record.id} />
								<DeleteButton
									resource={ROUTE_RESOURCE.school}
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
						)}
					/>
				</Table>
			)}
			{children}
		</List>
	);
};
