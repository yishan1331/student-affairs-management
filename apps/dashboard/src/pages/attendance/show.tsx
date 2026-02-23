import { useShow, useParsed, useCan, useResource } from "@refinedev/core";
import { Tag, Alert, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { IAttendance, AttendanceStatus } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE } from "../../common/constants";
import { DataSource } from "../../common/types/types";

const statusMap: Record<AttendanceStatus, { label: string; color: string }> = {
	[AttendanceStatus.attendance]: { label: "出席", color: "success" },
	[AttendanceStatus.absent]: { label: "缺席", color: "error" },
	[AttendanceStatus.late]: { label: "遲到", color: "warning" },
	[AttendanceStatus.excused]: { label: "請假", color: "processing" },
};

export const AttendanceShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.attendance,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as IAttendance;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.attendance,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.attendance,
		action: "delete",
	});

	const dataSources: DataSource<IAttendance>[] = [
		{ label: "學生ID", value: "student_id", type: "text" },
		{
			label: "日期",
			value: "date",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{dayjs(record?.date).format("YYYY-MM-DD")}
					</Typography.Text>
				);
			},
		},
		{
			label: "出勤狀態",
			value: "status",
			type: "custom",
			render: () => {
				const s = record?.status ? statusMap[record.status] : null;
				return s ? (
					<Tag color={s.color}>{s.label}</Tag>
				) : (
					<Typography.Text>{record?.status}</Typography.Text>
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
					resource={ROUTE_RESOURCE.attendance}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
