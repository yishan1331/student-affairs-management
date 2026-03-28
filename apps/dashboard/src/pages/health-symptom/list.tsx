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
import { type PropsWithChildren, useState } from "react";

import { IHealthSymptom, SymptomType, Severity } from "../../common/types/models";
import { ROUTE_PATH, ROUTE_RESOURCE, SYMPTOM_TYPE_MAP, SEVERITY_MAP } from "../../common/constants";
import { HealthSubjectSelector } from "../../components";
import { MobileCardList } from "../../components/mobile";
import type { MobileCardField } from "../../components/mobile";

export const HealthSymptomList = ({ children }: PropsWithChildren) => {
	const go = useGo();
	const { pathname } = useLocation();
	const { createUrl, show, edit } = useNavigation();
	const [petId, setPetId] = useState<number | undefined>(undefined);

	const { resource } = useResource();
	const { mutate: deleteRecord } = useDelete();

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

	const breakpoint = Grid.useBreakpoint();
	const isMobile = !breakpoint.md;

	const mobileFields: MobileCardField<IHealthSymptom>[] = [
		{
			label: "症狀類型",
			dataIndex: "symptom_type",
			render: (value: SymptomType) => {
				const t = SYMPTOM_TYPE_MAP[value];
				return t ? <Tag color={t.color}>{t.label}</Tag> : value;
			},
		},
		{
			label: "日期",
			dataIndex: "date",
			render: (value: string) => new Date(value).toLocaleDateString(),
		},
		{
			label: "嚴重程度",
			dataIndex: "severity",
			render: (value: Severity) => {
				const s = SEVERITY_MAP[value];
				return s ? <Tag color={s.color}>{s.label}</Tag> : value;
			},
		},
		{
			label: "次數",
			dataIndex: "frequency",
			render: (value: number) => `${value} 次`,
		},
		{
			label: "反覆發生",
			dataIndex: "is_recurring",
			render: (value: boolean) => (
				<Tag color={value ? "warning" : "default"}>
					{value ? "是" : "否"}
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
			{isMobile ? (
				<MobileCardList<IHealthSymptom>
					dataSource={records}
					fields={mobileFields}
					rowKey="id"
					loading={tableProps.loading as boolean}
					pagination={mobilePagination}
					onShow={(record) => show(ROUTE_RESOURCE.healthSymptom, record.id)}
					onEdit={(record) => edit(ROUTE_RESOURCE.healthSymptom, record.id)}
					onDelete={(record) => {
						deleteRecord({
							resource: ROUTE_RESOURCE.healthSymptom,
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
				{!isMobile && (
					<Table.Column
						dataIndex="body_part"
						title="身體部位"
						render={(value: string) => value || "-"}
					/>
				)}
				<Table.Column
					dataIndex="is_recurring"
					title="反覆發生"
					render={(value: boolean) => (
						<Tag color={value ? "warning" : "default"}>
							{value ? "是" : "否"}
						</Tag>
					)}
				/>
				{!isMobile && (
					<Table.Column
						dataIndex="note"
						title="備註"
						render={(value: string) => value || "-"}
					/>
				)}
				<Table.Column<IHealthSymptom>
					title="操作"
					width={isMobile ? 50 : undefined}
					render={(_: any, record: IHealthSymptom) =>
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
												show(ROUTE_RESOURCE.healthSymptom, record.id),
										},
										{
											key: "edit",
											icon: <EditOutlined />,
											label: "編輯",
											onClick: () =>
												edit(ROUTE_RESOURCE.healthSymptom, record.id),
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
																resource: ROUTE_RESOURCE.healthSymptom,
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
									resource={ROUTE_RESOURCE.healthSymptom}
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
