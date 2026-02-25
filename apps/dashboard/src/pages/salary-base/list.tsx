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

import { ISalaryBase } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";

export const SalaryBaseList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<ISalaryBase>({
		resource: ROUTE_RESOURCE.salaryBase,
		initialSorter: [
			{
				field: "updated_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as ISalaryBase[];

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
			<Table {...tableProps} dataSource={records} rowKey="id">
				<Table.Column
					dataIndex="id"
					title="ID"
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
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
				<Table.Column dataIndex="description" title="描述" />
				<Table.Column
					dataIndex="is_active"
					title="啟用狀態"
					render={(value: boolean) => (
						<Tag color={value ? "success" : "error"}>
							{value ? "啟用" : "未啟用"}
						</Tag>
					)}
				/>
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
				<Table.Column<ISalaryBase>
					title="操作"
					render={(_: any, record: ISalaryBase) => (
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
								resource={ROUTE_RESOURCE.salaryBase}
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
