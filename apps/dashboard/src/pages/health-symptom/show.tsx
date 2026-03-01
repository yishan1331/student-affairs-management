import { useShow, useParsed, useCan, useResource } from "@refinedev/core";
import { Tag, Alert, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { IHealthSymptom } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE, SYMPTOM_TYPE_MAP, SEVERITY_MAP } from "../../common/constants";
import { DataSource } from "../../common/types/types";

export const HealthSymptomShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.healthSymptom,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as IHealthSymptom;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.healthSymptom,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.healthSymptom,
		action: "delete",
	});

	const dataSources: DataSource<IHealthSymptom>[] = [
		{
			label: "記錄對象",
			value: "pet_id",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.pet ? `${record.pet.name}` : "我自己"}
				</Typography.Text>
			),
		},
		{
			label: "日期",
			value: "date",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.date ? dayjs(record.date).format("YYYY-MM-DD") : "-"}
				</Typography.Text>
			),
		},
		{ label: "時間", value: "time", type: "text" },
		{
			label: "症狀類型",
			value: "symptom_type",
			type: "custom",
			render: () => {
				const t = record?.symptom_type ? SYMPTOM_TYPE_MAP[record.symptom_type] : null;
				return t ? (
					<Tag color={t.color}>{t.label}</Tag>
				) : (
					<Typography.Text>{record?.symptom_type}</Typography.Text>
				);
			},
		},
		{
			label: "嚴重程度",
			value: "severity",
			type: "custom",
			render: () => {
				const s = record?.severity ? SEVERITY_MAP[record.severity] : null;
				return s ? (
					<Tag color={s.color}>{s.label}</Tag>
				) : (
					<Typography.Text>{record?.severity}</Typography.Text>
				);
			},
		},
		{
			label: "發生次數",
			value: "frequency",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.frequency ? `${record.frequency} 次` : "-"}</Typography.Text>
			),
		},
		{
			label: "持續時間",
			value: "duration_minutes",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.duration_minutes ? `${record.duration_minutes} 分鐘` : "-"}</Typography.Text>
			),
		},
		{
			label: "身體部位",
			value: "body_part",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.body_part || "-"}</Typography.Text>
			),
		},
		{
			label: "反覆發生",
			value: "is_recurring",
			type: "custom",
			render: () => (
				<Tag color={record?.is_recurring ? "warning" : "default"}>
					{record?.is_recurring ? "是" : "否"}
				</Tag>
			),
		},
		{
			label: "詳細描述",
			value: "description",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.description || "-"}</Typography.Text>
			),
		},
		{
			label: "備註",
			value: "note",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.note || "-"}</Typography.Text>
			),
		},
		{
			label: "建立時間",
			value: "created_at",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.created_at ? dayjs(record.created_at).format("YYYY-MM-DD HH:mm") : "-"}
				</Typography.Text>
			),
		},
		{
			label: "修改時間",
			value: "updated_at",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.updated_at ? dayjs(record.updated_at).format("YYYY-MM-DD HH:mm") : "-"}
				</Typography.Text>
			),
		},
	];

	if (isError) {
		return (
			<Alert
				message="錯誤"
				description={error?.message || "載入資料時發生錯誤"}
				type="error"
				showIcon
			/>
		);
	}

	return (
		<Show
			isLoading={isFetching}
			title={`${resource?.meta?.label}資料`}
			canDelete={canDelete?.can}
			canEdit={canEdit?.can}
			breadcrumb={
				<CustomBreadcrumb
					items={[
						{
							title: resource?.meta?.label || "",
							path: resource?.list?.toString() || "",
						},
						{
							title: `${resource?.meta?.label}資料`,
						},
					]}
				/>
			}
			headerButtons={({
				deleteButtonProps,
				editButtonProps,
				refreshButtonProps,
			}) => (
				<CustomShowHeaderButtons
					deleteButtonProps={{
						...deleteButtonProps,
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
					}}
					editButtonProps={editButtonProps}
					refreshButtonProps={{
						...refreshButtonProps,
						onClick: () => query.refetch(),
					}}
					resource={ROUTE_RESOURCE.healthSymptom}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
