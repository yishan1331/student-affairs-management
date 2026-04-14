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
import { MoreOutlined, EyeOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from "@ant-design/icons";
import { useGo, useNavigation, useResource, useDelete } from "@refinedev/core";
import { useLocation } from "react-router";
import { type PropsWithChildren } from "react";

import { IPet, PetType } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE, PET_TYPE_MAP, PET_GENDER_MAP } from "../../common/constants";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

export const PetList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl, show, edit } = useNavigation();

	const { resource } = useResource();
	const { mutate: deleteRecord } = useDelete();

	const { tableProps, sorters, setCurrent, setPageSize } = useTable<IPet>({
		resource: ROUTE_RESOURCE.pet,
		initialSorter: [
			{
				field: "created_at",
				order: "desc",
			},
		],
	});

	const records = tableProps.dataSource as IPet[];

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<IPet>[] = [
		{ label: "名稱", dataIndex: "name" },
		{
			label: "種類",
			dataIndex: "type",
			render: (value: PetType) => {
				const t = PET_TYPE_MAP[value];
				return t ? <Tag color={t.color}>{t.label}</Tag> : value;
			},
		},
		{
			label: "品種",
			dataIndex: "breed",
			render: (value: string) => value || "-",
		},
		{
			label: "性別",
			dataIndex: "gender",
			render: (value: string) => {
				const g = value ? PET_GENDER_MAP[value] : null;
				return g ? <Tag color={g.color}>{g.label}</Tag> : "-";
			},
		},
		{
			label: "狀態",
			dataIndex: "is_active",
			render: (value: boolean) => (
				<Tag color={value ? "success" : "default"}>
					{value ? "啟用" : "停用"}
				</Tag>
			),
		},
	];

	const mobilePagination = isMobile ? {
		current: (tableProps.pagination as any)?.current,
		pageSize: (tableProps.pagination as any)?.pageSize,
		total: (tableProps.pagination as any)?.total,
		onChange: (page: number, size: number) => {
			setCurrent(page);
			setPageSize(size);
		},
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
			{isMobile ? (
				<MobileCardList<IPet>
					dataSource={records}
					fields={mobileFields}
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_RESOURCE.pet, record.id)}
					onEdit={(record) => edit(ROUTE_RESOURCE.pet, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.pet,
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
						dataIndex="petUsers"
						title="共享"
						render={(_: any, rec: IPet) => {
							const sharedCount = (rec.petUsers?.filter((pu) => pu.role !== "owner").length) ?? 0;
							if (sharedCount > 0) {
								return (
									<Tag icon={<TeamOutlined />} color="blue">
										共享 ({sharedCount})
									</Tag>
								);
							}
							return "-";
						}}
					/>
					<Table.Column<IPet>
						title="操作"
						width={isMobile ? 50 : undefined}
						render={(_: any, record: IPet) =>
							isMobile ? (
								<Dropdown
									trigger={["click"]}
									menu={{
										items: [
											{
												key: "show",
												icon: <EyeOutlined />,
												label: "查看",
												onClick: () =>
													show(ROUTE_RESOURCE.pet, record.id),
											},
											{
												key: "edit",
												icon: <EditOutlined />,
												label: "編輯",
												onClick: () =>
													edit(ROUTE_RESOURCE.pet, record.id),
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
															deleteRecord(
																{
																	resource: ROUTE_RESOURCE.pet,
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
																},
															);
														},
													});
												},
											},
										],
									}}
								>
									<Button
										type="text"
										icon={<MoreOutlined />}
										size="small"
									/>
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
										resource={ROUTE_RESOURCE.pet}
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
							)
						}
					/>
				</Table>
			)}
			{children}
		</List>
	);
};
