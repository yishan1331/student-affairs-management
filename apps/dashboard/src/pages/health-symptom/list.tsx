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
import { type PropsWithChildren, useState } from "react";

import { IHealthSymptom, SymptomType, Severity } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE, SYMPTOM_TYPE_MAP, SEVERITY_MAP } from "../../common/constants";
import { HealthSubjectSelector } from "../../components";

export const HealthSymptomList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();
	const [petId, setPetId] = useState<number | undefined>(undefined);

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<IHealthSymptom>({
		resource: ROUTE_RESOURCE.healthSymptom,
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

	const records = tableProps.dataSource as IHealthSymptom[];

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
							to: `${createUrl(ROUTE_PATH.healthSymptom)}`,
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
				<Table.Column dataIndex="time" title="時間" />
				<Table.Column
					dataIndex="symptom_type"
					title="症狀類型"
					render={(value: SymptomType) => {
						const t = SYMPTOM_TYPE_MAP[value];
						return t ? (
							<Tag color={t.color}>{t.label}</Tag>
						) : (
							value
						);
					}}
				/>
				<Table.Column
					dataIndex="severity"
					title="嚴重程度"
					render={(value: Severity) => {
						const s = SEVERITY_MAP[value];
						return s ? (
							<Tag color={s.color}>{s.label}</Tag>
						) : (
							value
						);
					}}
				/>
				<Table.Column
					dataIndex="frequency"
					title="次數"
					render={(value: number) => `${value} 次`}
				/>
				<Table.Column
					dataIndex="duration_minutes"
					title="持續時間"
					render={(value: number | null) => value ? `${value} 分鐘` : "-"}
				/>
				<Table.Column
					dataIndex="body_part"
					title="身體部位"
					render={(value: string) => value || "-"}
				/>
				<Table.Column
					dataIndex="is_recurring"
					title="反覆發生"
					render={(value: boolean) => (
						<Tag color={value ? "warning" : "default"}>
							{value ? "是" : "否"}
						</Tag>
					)}
				/>
				<Table.Column
					dataIndex="note"
					title="備註"
					render={(value: string) => value || "-"}
				/>
				<Table.Column<IHealthSymptom>
					title="操作"
					render={(_: any, record: IHealthSymptom) => (
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
								resource={ROUTE_RESOURCE.healthSymptom}
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
