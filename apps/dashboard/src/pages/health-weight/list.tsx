import {
	List,
	useTable,
	EditButton,
	ShowButton,
	DeleteButton,
	CreateButton,
	getDefaultSortOrder,
} from "@refinedev/antd";
import { Space, Table } from "antd";
import { useGo, useNavigation, useResource } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren, useState } from "react";

import { IHealthWeight } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE } from "../../common/constants";
import { HealthSubjectSelector } from "../../components";

export const HealthWeightList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();
	const [petId, setPetId] = useState<number | undefined>(undefined);

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<IHealthWeight>({
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
			<HealthSubjectSelector value={petId} onChange={setPetId} />
			<Table {...tableProps} dataSource={records} rowKey="id">
				<Table.Column
					dataIndex="id"
					title="ID"
					defaultSortOrder={getDefaultSortOrder("id", sorters)}
				/>
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
					render={(value: number) => value?.toFixed(1) ?? "-"}
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
					dataIndex="note"
					title="備註"
					render={(value: string) => value || "-"}
				/>
				<Table.Column
					dataIndex="created_at"
					title="建立時間"
					render={(value: string) =>
						new Date(value).toLocaleString()
					}
				/>
				<Table.Column<IHealthWeight>
					title="操作"
					render={(_: any, record: IHealthWeight) => (
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
								resource={ROUTE_RESOURCE.healthWeight}
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
