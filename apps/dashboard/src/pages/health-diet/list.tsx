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

import { IHealthDiet, MealType } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";

const mealTypeMap: Record<MealType, { label: string; color: string }> = {
	[MealType.breakfast]: { label: "早餐", color: "orange" },
	[MealType.lunch]: { label: "午餐", color: "green" },
	[MealType.dinner]: { label: "晚餐", color: "blue" },
	[MealType.snack]: { label: "點心", color: "purple" },
};

export const HealthDietList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<IHealthDiet>({
		resource: ROUTE_RESOURCE.healthDiet,
		initialSorter: [
			{
				field: "date",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as IHealthDiet[];

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
			<Table {...tableProps} dataSource={records} rowKey="id">
				<Table.Column
					dataIndex="id"
					title="ID"
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
				<Table.Column
					dataIndex="date"
					title="日期"
					render={(value: string) =>
						new Date(value).toLocaleDateString()
					}
				/>
				<Table.Column
					dataIndex="meal_type"
					title="餐別"
					render={(value: MealType) => {
						const m = mealTypeMap[value];
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
					render={(_: any, record: IHealthDiet) => (
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
								resource={ROUTE_RESOURCE.healthDiet}
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
