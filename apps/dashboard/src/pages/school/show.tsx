import { useShow, useParsed, useCan, useResource } from "@refinedev/core";
import { Tag, Alert, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { ISchool } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE } from "../../common/constants";
import { DataSource } from "../../common/types/types";

export const SchoolShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.school,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as ISchool;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.school,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.school,
		action: "delete",
	});

	const dataSources: DataSource<ISchool>[] = [
		{ label: "學校名稱", value: "name", type: "text" },
		{ label: "描述", value: "description", type: "text" },
		{ label: "排序", value: "display_order", type: "text" },
		{
			label: "啟用狀態",
			value: "is_active",
			type: "custom",
			render: () => {
				return record?.is_active ? (
					<Tag color="success">啟用</Tag>
				) : (
					<Tag color="error">未啟用</Tag>
				);
			},
		},
		{ label: "修改者ID", value: "modifier_id", type: "text" },
		{
			label: "建立時間",
			value: "created_at",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{dayjs(record?.created_at).format("YYYY-MM-DD")}
					</Typography.Text>
				);
			},
		},
		{
			label: "修改時間",
			value: "updated_at",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{dayjs(record?.updated_at).format("YYYY-MM-DD")}
					</Typography.Text>
				);
			},
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
					resource={ROUTE_RESOURCE.school}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
