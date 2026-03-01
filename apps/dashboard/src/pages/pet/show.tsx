import { useShow, useParsed, useCan, useResource } from "@refinedev/core";
import { Tag, Alert, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { IPet, PetType } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE, PET_TYPE_MAP, PET_GENDER_MAP } from "../../common/constants";
import { DataSource } from "../../common/types/types";

export const PetShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.pet,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as IPet;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.pet,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.pet,
		action: "delete",
	});

	const dataSources: DataSource<IPet>[] = [
		{ label: "名稱", value: "name", type: "text" },
		{
			label: "種類",
			value: "type",
			type: "custom",
			render: () => {
				const t = record?.type ? PET_TYPE_MAP[record.type] : null;
				return t ? (
					<Tag color={t.color}>{t.label}</Tag>
				) : (
					<Typography.Text>{record?.type}</Typography.Text>
				);
			},
		},
		{
			label: "品種",
			value: "breed",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.breed || "-"}</Typography.Text>
			),
		},
		{
			label: "性別",
			value: "gender",
			type: "custom",
			render: () => {
				const g = record?.gender ? PET_GENDER_MAP[record.gender] : null;
				return g ? (
					<Tag color={g.color}>{g.label}</Tag>
				) : (
					<Typography.Text>-</Typography.Text>
				);
			},
		},
		{
			label: "生日",
			value: "birthday",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.birthday ? dayjs(record.birthday).format("YYYY-MM-DD") : "-"}
				</Typography.Text>
			),
		},
		{
			label: "體重 (kg)",
			value: "weight",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.weight ? record.weight.toFixed(1) : "-"}
				</Typography.Text>
			),
		},
		{
			label: "狀態",
			value: "is_active",
			type: "custom",
			render: () => (
				<Tag color={record?.is_active ? "success" : "default"}>
					{record?.is_active ? "啟用" : "停用"}
				</Tag>
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
					resource={ROUTE_RESOURCE.pet}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
