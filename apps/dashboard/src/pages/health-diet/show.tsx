import { useShow, useParsed, useCan, useResource } from "@refinedev/core";
import { Tag, Alert, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { IHealthDiet } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE, MEAL_TYPE_MAP } from "../../common/constants";
import { DataSource } from "../../common/types/types";

export const HealthDietShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.healthDiet,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as IHealthDiet;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.healthDiet,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.healthDiet,
		action: "delete",
	});

	const dataSources: DataSource<IHealthDiet>[] = [
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
		{
			label: "餐別",
			value: "meal_type",
			type: "custom",
			render: () => {
				const m = record?.meal_type
					? MEAL_TYPE_MAP[record.meal_type]
					: null;
				return m ? (
					<Tag color={m.color}>{m.label}</Tag>
				) : (
					<Typography.Text>{record?.meal_type}</Typography.Text>
				);
			},
		},
		{ label: "食物名稱", value: "food_name", type: "text" },
		{
			label: "份量",
			value: "amount",
			type: "custom",
			render: () => (
				<Typography.Text>{record?.amount || "-"}</Typography.Text>
			),
		},
		{
			label: "卡路里",
			value: "calories",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.calories != null ? record.calories : "-"}
				</Typography.Text>
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
					resource={ROUTE_RESOURCE.healthDiet}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
