import {
	useShow,
	useParsed,
	useCan,
	useResource,
	useOne,
} from "@refinedev/core";
import { Alert, Tag, Typography } from "antd";
import { Show } from "@refinedev/antd";
import dayjs from "dayjs";

import {
	ICourseSession,
	ICourse,
	ISalaryBase,
} from "../../common/types/models";
import {
	CustomBreadcrumb,
	CustomShowHeaderButtons,
	CustomShowList,
} from "../../components";
import { ROUTE_RESOURCE } from "../../common/constants";
import { DataSource } from "../../common/types/types";

export const CourseSessionShow = () => {
	const { id } = useParsed();
	const { query } = useShow({
		resource: ROUTE_RESOURCE.courseSession,
		id,
	});

	const { data, isFetching, isError, error } = query;
	const record = data?.data as ICourseSession;

	const { resource } = useResource();

	const { data: canEdit } = useCan({
		resource: ROUTE_RESOURCE.courseSession,
		action: "edit",
	});

	const { data: canDelete } = useCan({
		resource: ROUTE_RESOURCE.courseSession,
		action: "delete",
	});

	const { data: courseData } = useOne<ICourse>({
		resource: ROUTE_RESOURCE.course,
		id: record?.course_id,
		queryOptions: {
			enabled: !!record?.course_id,
		},
	});
	const course = courseData?.data;

	const { data: salaryBaseData } = useOne<ISalaryBase>({
		resource: ROUTE_RESOURCE.salaryBase,
		id: record?.salary_base_id ?? undefined,
		queryOptions: {
			enabled: !!record?.salary_base_id,
		},
	});
	const salaryBase = salaryBaseData?.data;

	const dataSources: DataSource<ICourseSession>[] = [
		{
			label: "課程",
			value: "course_id",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{course?.name || record?.course?.name}
					</Typography.Text>
				);
			},
		},
		{
			label: "學校",
			value: "course_id",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{(course as any)?.school?.name ||
							record?.course?.school?.name ||
							"-"}
					</Typography.Text>
				);
			},
		},
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
			label: "上課時間",
			value: "course_id",
			type: "custom",
			render: () => {
				const c = course || record?.course;
				if (!c?.start_time || !c?.end_time) return <Typography.Text>-</Typography.Text>;
				const start = dayjs(c.start_time).format("HH:mm");
				const end = dayjs(c.end_time).format("HH:mm");
				const dur = (c as any)?.duration as number | undefined;
				const durText = dur
					? ` (${Math.floor(dur / 60) > 0 ? `${Math.floor(dur / 60)}h` : ""}${dur % 60 > 0 ? `${dur % 60}m` : ""})`
					: "";
				return (
					<Typography.Text>
						{start} - {end}{durText}
					</Typography.Text>
				);
			},
		},
		{
			label: "課程狀態",
			value: "is_cancelled",
			type: "custom",
			render: () => {
				return (
					<Tag color={record?.is_cancelled ? "error" : "success"}>
						{record?.is_cancelled ? "停課" : "正常"}
					</Tag>
				);
			},
		},
		{
			label: "實際上課人數",
			value: "actual_student_count",
			type: "text",
		},
		{
			label: "薪資金額",
			value: "salary_amount",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{record?.salary_amount != null
							? `$${record.salary_amount}`
							: "未設定"}
					</Typography.Text>
				);
			},
		},
		{
			label: "薪資級距",
			value: "salary_base_id",
			type: "custom",
			render: () => {
				return (
					<Typography.Text>
						{salaryBase?.name ||
							record?.salaryBase?.name ||
							"未設定"}
					</Typography.Text>
				);
			},
		},
		{ label: "備註", value: "note", type: "text" },
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
					resource={ROUTE_RESOURCE.courseSession}
				/>
			)}
		>
			<CustomShowList record={record} dataSources={dataSources} />
		</Show>
	);
};
