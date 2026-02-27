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

import { IHealthToilet, ToiletType } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE, TOILET_TYPE_MAP } from "../../common/constants";

export const HealthToiletList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<IHealthToilet>({
		resource: ROUTE_RESOURCE.healthToilet,
		initialSorter: [
			{
				field: "date",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as IHealthToilet[];

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
							to: `${createUrl(ROUTE_PATH.healthToilet)}`,
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
					sorter
					render={(value: string) =>
						new Date(value).toLocaleDateString()
					}
				/>
				<Table.Column dataIndex="time" title="時間" />
				<Table.Column
					dataIndex="type"
					title="類型"
					render={(value: ToiletType) => {
						const t = TOILET_TYPE_MAP[value];
						return t ? (
							<Tag color={t.color}>{t.label}</Tag>
						) : (
							value
						);
					}}
				/>
				<Table.Column
					dataIndex="is_normal"
					title="是否正常"
					render={(value: boolean) => (
						<Tag color={value ? "success" : "error"}>
							{value ? "正常" : "異常"}
						</Tag>
					)}
				/>
				<Table.Column
					dataIndex="note"
					title="備註"
					render={(value: string) => value || "-"}
				/>
				<Table.Column<IHealthToilet>
					title="操作"
					render={(_: any, record: IHealthToilet) => (
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
								resource={ROUTE_RESOURCE.healthToilet}
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
