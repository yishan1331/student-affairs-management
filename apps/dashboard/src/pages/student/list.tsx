import {
	List,
	useTable,
	EditButton,
	ShowButton,
	DeleteButton,
	CreateButton,
	getDefaultSortOrder,
} from "@refinedev/antd";
import { Grid, Space, Table, Tag } from "antd";
import { useGo, useNavigation, useResource, useDelete } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren } from "react";

import { IStudent } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

export const StudentList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl, show, edit } = useNavigation();

	const { resource } = useResource();
	const { mutate: deleteRecord } = useDelete();

	const { tableProps, sorters } = useTable<IStudent>({
		resource: ROUTE_RESOURCE.student,
		initialSorter: [
			{
				field: "updated_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as IStudent[];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<IStudent>[] = [
		{ dataIndex: "name", label: "姓名" },
		{ dataIndex: "number", label: "學號" },
		{
			dataIndex: "gender",
			label: "性別",
			render: (value: any) => (value === "male" ? "男" : "女"),
		},
		{
			dataIndex: "is_active",
			label: "啟用狀態",
			render: (value: any) => (
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
							to: `${createUrl(ROUTE_PATH.student)}`,
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
				<MobileCardList<IStudent>
					dataSource={records}
					fields={mobileFields}
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_RESOURCE.student, record.id)}
					onEdit={(record) => edit(ROUTE_RESOURCE.student, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.student,
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
					<Table.Column dataIndex="name" title="姓名" />
					<Table.Column dataIndex="number" title="學號" />
					<Table.Column
						dataIndex="gender"
						title="性別"
						render={(value: string) =>
							value === "male" ? "男" : "女"
						}
					/>
					<Table.Column dataIndex="course_id" title="課程ID" />
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
					<Table.Column<IStudent>
						title="操作"
						render={(_: any, record: IStudent) => (
							<Space>
								<ShowButton hideText size="middle" recordItemId={record.id} />
								<EditButton hideText size="middle" recordItemId={record.id} />
								<DeleteButton
									resource={ROUTE_RESOURCE.student}
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
