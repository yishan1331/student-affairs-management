import { useShow, useParsed, useCan, useResource } from "@refinedev/core";
import { Alert, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { IHealthWeight } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE } from "../../common/constants";
import { DataSource } from "../../common/types/types";

export const HealthWeightShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.healthWeight,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as IHealthWeight;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.healthWeight,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.healthWeight,
		action: "delete",
	});

	const dataSources: DataSource<IHealthWeight>[] = [
		{
			label: "日期",
			value: "date",
			type: "custom",
			render: () => (
				<Typography.Text>
					{dayjs(record?.date).format("YYYY-MM-DD")}
				</Typography.Text>
			),
		},
		{
			label: "體重 (kg)",
			value: "weight",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.weight?.toFixed(1)}
				</Typography.Text>
			),
		},
		{
			label: "身高 (cm)",
			value: "height",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.height ? record.height.toFixed(1) : "-"}
				</Typography.Text>
			),
		},
		{
			label: "BMI",
			value: "bmi",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.bmi ? record.bmi.toFixed(1) : "-"}
				</Typography.Text>
			),
		},
		{
			label: "備註",
			value: "note",
			type: "custom",
			render: () => (
				<Typography.Text>
					{record?.note || "-"}
				</Typography.Text>
			),
		},
		{
			label: "建立時間",
			value: "created_at",
			type: "custom",
			render: () => (
				<Typography.Text>
					{dayjs(record?.created_at).format("YYYY-MM-DD HH:mm")}
				</Typography.Text>
			),
		},
		{
			label: "修改時間",
			value: "updated_at",
			type: "custom",
			render: () => (
				<Typography.Text>
					{dayjs(record?.updated_at).format("YYYY-MM-DD HH:mm")}
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
					resource={ROUTE_RESOURCE.healthWeight}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
