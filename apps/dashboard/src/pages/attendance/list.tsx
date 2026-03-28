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

import { IAttendance, AttendanceStatus } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

const statusMap: Record<AttendanceStatus, { label: string; color: string }> = {
	[AttendanceStatus.attendance]: { label: "出席", color: "success" },
	[AttendanceStatus.absent]: { label: "缺席", color: "error" },
	[AttendanceStatus.late]: { label: "遲到", color: "warning" },
	[AttendanceStatus.excused]: { label: "請假", color: "processing" },
};

export const AttendanceList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl, show, edit } = useNavigation();

	const { resource } = useResource();
	const { mutate: deleteRecord } = useDelete();

	const { tableProps, sorters } = useTable<IAttendance>({
		resource: ROUTE_RESOURCE.attendance,
		initialSorter: [
			{
				field: "updated_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as IAttendance[];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<IAttendance>[] = [
		{
			dataIndex: "student_id",
			label: "學生ID",
		},
		{
			dataIndex: "date",
			label: "日期",
			render: (value: string) => new Date(value).toLocaleDateString(),
		},
		{
			dataIndex: "status",
			label: "出勤狀態",
			render: (value: AttendanceStatus) => {
				const s = statusMap[value];
				return s ? <Tag color={s.color}>{s.label}</Tag> : value;
			},
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
							to: `${createUrl(ROUTE_PATH.attendance)}`,
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
				<MobileCardList<IAttendance>
					dataSource={records}
					fields={mobileFields}
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_RESOURCE.attendance, record.id)}
					onEdit={(record) => edit(ROUTE_RESOURCE.attendance, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.attendance,
							id: record.id,
							successNotification: { message: "刪除成功", description: `${resource?.meta?.label}已成功刪除`, type: "success" },
							errorNotification: { message: "刪除失敗", description: `無法刪除${resource?.meta?.label}`, type: "error" },
						});
					}}
				/>
			) : (
				<Table {...tableProps} dataSource={records} rowKey="id" scroll={{ x: 'max-content' }}>
					{!isMobile && (
						<Table.Column
							dataIndex="id"
							title="ID"
							defaultSortOrder={getDefaultSortOrder("id", sorters)}
						/>
					)}
					<Table.Column dataIndex="student_id" title="學生ID" />
					<Table.Column
						dataIndex="date"
						title="日期"
						render={(value: string) =>
							new Date(value).toLocaleDateString()
						}
					/>
					<Table.Column
						dataIndex="status"
						title="出勤狀態"
						render={(value: AttendanceStatus) => {
							const s = statusMap[value];
							return s ? (
								<Tag color={s.color}>{s.label}</Tag>
							) : (
								value
							);
						}}
					/>
					{!isMobile && (
						<Table.Column dataIndex="modifier_id" title="修改者ID" />
					)}
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
					<Table.Column<IAttendance>
						title="操作"
						width={isMobile ? 50 : undefined}
						render={(_: any, record: IAttendance) =>
							isMobile ? (
								<Dropdown
									trigger={["click"]}
									menu={{
										items: [
											{
												key: "show",
												icon: <EyeOutlined />,
												label: "查看",
												onClick: () => show(ROUTE_RESOURCE.attendance, record.id),
											},
											{
												key: "edit",
												icon: <EditOutlined />,
												label: "編輯",
												onClick: () => edit(ROUTE_RESOURCE.attendance, record.id),
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
																resource: ROUTE_RESOURCE.attendance,
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
										resource={ROUTE_RESOURCE.attendance}
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
