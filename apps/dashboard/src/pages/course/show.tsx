import {
	useShow,
	useParsed,
	useCan,
	useResource,
	useOne,
} from "@refinedev/core";
import { Tag, Alert, Typography, Flex, Avatar } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import { ICourse, ISchool } from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE } from "../../common/constants";
import { DataSource } from "../../common/types/types";
import { MedicineBoxOutlined } from "@ant-design/icons";

export const CourseShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.course,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as ICourse;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.course,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.course,
		action: "delete",
	});

	const { data: categoryData } = useOne<ISchool>({
		resource: ROUTE_RESOURCE.school,
		id: record?.school_id,
		queryOptions: {
			enabled: !!record?.school_id,
		},
	});
	const medicalCategory = categoryData?.data;

	const dataSources: DataSource<ICourse>[] = [
		{ label: "課程名稱", value: "name", type: "text" },
		{ label: "描述", value: "description", type: "text" },
		{ label: "課程等級", value: "grade", type: "text" },
		{ label: "課程開始時間", value: "start_time", type: "text" },
		{
			label: "學校名稱",
			value: "school_id",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>{medicalCategory?.name}</Typography.Text>
				);
			},
		},
		{ label: "課程結束時間", value: "end_time", type: "text" },
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
							description: `${resource?.meta?.label?.slice(0, 2)}資料已成功刪除`,
							type: "success",
						},
						errorNotification: {
							message: "刪除失敗",
							description: `無法刪除${resource?.meta?.label?.slice(0, 2)}資料`,
							type: "error",
						},
					}}
					editButtonProps={editButtonProps}
					refreshButtonProps={{
						...refreshButtonProps,
						onClick: () => query.refetch(),
					}}
					resource={ROUTE_RESOURCE.course}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
