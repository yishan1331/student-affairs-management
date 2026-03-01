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

import { IPet, PetType } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE, PET_TYPE_MAP, PET_GENDER_MAP } from "../../common/constants";

export const PetList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl } = useNavigation();

	const { resource } = useResource();

	const { tableProps, sorters } = useTable<IPet>({
		resource: ROUTE_RESOURCE.pet,
		initialSorter: [
			{
				field: "created_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as IPet[];

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
							to: `${createUrl(ROUTE_PATH.pet)}`,
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
					新增寵物
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
				<Table.Column
					dataIndex="type"
					title="種類"
					render={(value: PetType) => {
						const t = PET_TYPE_MAP[value];
						return t ? (
							<Tag color={t.color}>{t.label}</Tag>
						) : (
							value
						);
					}}
				/>
				<Table.Column
					dataIndex="breed"
					title="品種"
					render={(value: string) => value || "-"}
				/>
				<Table.Column
					dataIndex="gender"
					title="性別"
					render={(value: string) => {
						const g = value ? PET_GENDER_MAP[value] : null;
						return g ? (
							<Tag color={g.color}>{g.label}</Tag>
						) : (
							"-"
						);
					}}
				/>
				<Table.Column
					dataIndex="birthday"
					title="生日"
					render={(value: string) =>
						value ? new Date(value).toLocaleDateString() : "-"
					}
				/>
				<Table.Column
					dataIndex="is_active"
					title="狀態"
					render={(value: boolean) => (
						<Tag color={value ? "success" : "default"}>
							{value ? "啟用" : "停用"}
						</Tag>
					)}
				/>
				<Table.Column<IPet>
					title="操作"
					render={(_: any, record: IPet) => (
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
								resource={ROUTE_RESOURCE.pet}
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
