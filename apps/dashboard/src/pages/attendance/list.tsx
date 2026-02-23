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

import { IAttendance, AttendanceStatus } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";

const statusMap: Record<AttendanceStatus, { label: string; color: string }> = {
	[AttendanceStatus.attendance]: { label: "出席", color: "success" },
	[AttendanceStatus.absent]: { label: "缺席", color: "error" },
	[AttendanceStatus.late]: { label: "遲到", color: "warning" },
	[AttendanceStatus.excused]: { label: "請假", color: "processing" },
};

export const AttendanceList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

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
			<Table {...tableProps} dataSource={records} rowKey="id">
				<Table.Column
					dataIndex="id"
					title="ID"
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
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
				<Table.Column dataIndex="modifier_id" title="修改者ID" />
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
				<Table.Column<IAttendance>
					title="操作"
					render={(_: any, record: IAttendance) => (
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
								resource={ROUTE_RESOURCE.attendance}
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
